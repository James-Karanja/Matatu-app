#!/usr/bin/env node
/**
 * Ingest the Digital Matatus Nairobi GTFS feed into the app's data format.
 *
 * Source feed: Digital Matatus (University of Nairobi C4D Lab / Columbia
 * University / MIT Civic Data Design Lab), http://www.digitalmatatus.com/
 * — mirrored on GitHub at marketplace-ops/Nairobi_GTFS.
 *
 * Usage:
 *   node scripts/ingest-gtfs.mjs <gtfs-dir>            # from local files
 *   node scripts/ingest-gtfs.mjs --download [gtfs-dir] # fetch mirror first
 *
 * Emits:
 *   src/data/network.json — stages + routes (bundled with the app core)
 *   src/data/shapes.json  — simplified route polylines (lazy-loaded by the map)
 *
 * The feed has no fare files, so fares default to a broad "to verify" band;
 * the CURATED overrides below carry the field-checked sample fares from the
 * original 10-route MVP, matched by route number + name.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'src', 'data');
const MIRROR = 'https://raw.githubusercontent.com/marketplace-ops/Nairobi_GTFS/main';
const FILES = [
  'agency.txt', 'feed_info.txt', 'routes.txt', 'trips.txt',
  'stops.txt', 'stop_times.txt', 'frequencies.txt', 'shapes.txt',
];

// Stops sharing a normalized name within this distance are one stage.
const STAGE_MERGE_METERS = 250;
// Douglas-Peucker tolerance in degrees (~13 m) for shape simplification.
const SHAPE_TOLERANCE = 0.00012;
// Nairobi CBD bounding box — stages inside are treated as walkably close
// for cross-town transfers.
const CBD = { latMin: -1.295, latMax: -1.276, lngMin: 36.812, lngMax: 36.838 };

// Field-checked sample fares / operators from the 10-route MVP, applied when
// a GTFS route matches number + name. Everything else gets DEFAULT_FARE.
const DEFAULT_FARE = { offPeak: [50, 100], peak: [80, 150], rainMax: 200 };
const CURATED = [
  { number: /^0*46[A-Z]?$/, name: /kawangware/i, fare: { offPeak: [50, 80], peak: [80, 100], rainMax: 120 }, sacco: 'Operator to verify' },
  { number: /^0*111$/, name: /ngong/i, fare: { offPeak: [80, 100], peak: [100, 150], rainMax: 200 }, sacco: 'Super Metro (to verify)' },
  { number: /^0*125[A-Z]?$/, name: /rongai/i, fare: { offPeak: [70, 100], peak: [100, 150], rainMax: 200 }, sacco: 'Super Metro / others (to verify)' },
  { number: /^0*126[A-Z]?$/, name: /rongai|kiserian/i, fare: { offPeak: [70, 100], peak: [100, 150], rainMax: 200 } },
  { number: /^0*237[A-Z]?$/, name: /thika|juja/i, fare: { offPeak: [80, 120], peak: [120, 200], rainMax: 250 }, sacco: 'Kenya Mpya / Super Metro (to verify)' },
  { number: /^0*45[A-Z]?$/, name: /githurai/i, fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 } },
  { number: /^0*44[A-Z]?$/, name: /githurai|kahawa|zimmerman/i, fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 } },
  { number: /^0*58[A-Z]?$/, name: /buru/i, fare: { offPeak: [50, 70], peak: [70, 100], rainMax: 120 }, sacco: 'Citi Hoppa / KBS (to verify)' },
  { number: /^0*23[A-Z]?$/, name: /umoja|inner/i, fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 }, sacco: 'Umoinner (to verify)' },
  { number: /^0*105[A-Z]?$/, name: /kikuyu/i, fare: { offPeak: [60, 90], peak: [100, 150], rainMax: 180 }, sacco: 'Super Metro / others (to verify)' },
  { number: /^0*33[A-Z]?$/, name: /embakasi|pipeline/i, fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 }, sacco: 'Embassava (to verify)' },
];

// Search aliases layered onto well-known stages by exact (normalized) name.
const ALIASES = {
  kencom: ['Kencom House', 'City Hall Way'],
  odeon: ['Odeon Cinema', 'Tom Mboya Street'],
  railways: ['Railways Terminus', 'Haile Selassie'],
  ambassadeur: ['Ambassador', 'Hilton'],
  'bus station': ['Machakos Bus Stage'],
  koja: ['Koja Roundabout'],
  'gpo': ['Kenyatta Avenue', 'Posta'],
  westlands: ['Westi'],
  kawangware: ['Congo'],
  zimmerman: ['Zimma'],
};

// ── CSV ────────────────────────────────────────────────────────────────
function parseCsv(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.trim().replace(/^﻿/, ''));
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

// ── geometry ───────────────────────────────────────────────────────────
function metersBetween(a, b) {
  const dLat = (a.lat - b.lat) * 111320;
  const dLng = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const sqTol = tolerance * tolerance;
  const sqSegDist = (p, a, b) => {
    let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = b[0]; y = b[1]; }
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    return (p[0] - x) ** 2 + (p[1] - y) ** 2;
  };
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0, index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxDist) { maxDist = d; index = i; }
    }
    if (maxDist > sqTol) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const round5 = (n) => Math.round(n * 1e5) / 1e5;
const normName = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function fmt12h(hms) {
  const h = parseInt(hms.split(':')[0], 10) % 24;
  const m = hms.split(':')[1] ?? '00';
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${ampm}`;
}

// ── main ───────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const download = args.includes('--download');
  const dir = args.find((a) => !a.startsWith('--')) ?? join(HERE, '..', '.gtfs-cache');

  if (download) {
    mkdirSync(dir, { recursive: true });
    for (const f of FILES) {
      const res = await fetch(`${MIRROR}/${f}`);
      if (!res.ok) throw new Error(`download failed: ${f} → HTTP ${res.status}`);
      writeFileSync(join(dir, f), await res.text());
      console.log(`fetched ${f}`);
    }
  }
  for (const f of FILES) {
    if (!existsSync(join(dir, f))) throw new Error(`missing ${join(dir, f)} — run with --download`);
  }
  const load = (f) => parseCsv(readFileSync(join(dir, f), 'utf8'));

  const feedInfo = load('feed_info.txt')[0] ?? {};
  const gtfsRoutes = load('routes.txt');
  const gtfsTrips = load('trips.txt');
  const gtfsStops = load('stops.txt');
  const gtfsStopTimes = load('stop_times.txt');
  const gtfsFrequencies = load('frequencies.txt');
  const gtfsShapes = load('shapes.txt');

  // stop_times grouped per trip, ordered
  const tripStops = new Map();
  for (const st of gtfsStopTimes) {
    if (!tripStops.has(st.trip_id)) tripStops.set(st.trip_id, []);
    tripStops.get(st.trip_id).push({ seq: Number(st.stop_sequence), stop: st.stop_id });
  }
  for (const arr of tripStops.values()) arr.sort((a, b) => a.seq - b.seq);

  // canonical trip per route: direction 0 preferred, longest stop list wins
  const tripsByRoute = new Map();
  for (const t of gtfsTrips) {
    if (!tripsByRoute.has(t.route_id)) tripsByRoute.set(t.route_id, []);
    tripsByRoute.get(t.route_id).push(t);
  }
  const canonical = new Map();
  for (const [routeId, trips] of tripsByRoute) {
    const scored = trips
      .map((t) => ({ t, n: tripStops.get(t.trip_id)?.length ?? 0 }))
      .filter((x) => x.n >= 2)
      .sort((a, b) => (a.t.direction_id === '0' ? -1 : 0) - (b.t.direction_id === '0' ? -1 : 0) || b.n - a.n);
    if (scored.length) canonical.set(routeId, scored[0].t);
  }

  // stage merging: same normalized name within STAGE_MERGE_METERS
  const stopById = new Map(gtfsStops.map((s) => [s.stop_id, s]));
  const usedStopIds = new Set();
  for (const trip of canonical.values()) {
    for (const { stop } of tripStops.get(trip.trip_id)) usedStopIds.add(stop);
  }
  const byName = new Map();
  for (const id of usedStopIds) {
    const s = stopById.get(id);
    if (!s) continue;
    const key = normName(s.stop_name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push({ id, name: s.stop_name, lat: Number(s.stop_lat), lng: Number(s.stop_lon) });
  }
  const stageOfStop = new Map();
  const stages = [];
  for (const [key, members] of byName) {
    const clusters = [];
    for (const m of members) {
      const home = clusters.find((c) => metersBetween(c.centroid, m) <= STAGE_MERGE_METERS);
      if (home) {
        home.members.push(m);
        home.centroid = {
          lat: home.members.reduce((a, x) => a + x.lat, 0) / home.members.length,
          lng: home.members.reduce((a, x) => a + x.lng, 0) / home.members.length,
        };
      } else clusters.push({ members: [m], centroid: { lat: m.lat, lng: m.lng } });
    }
    for (const c of clusters) {
      const id = c.members[0].id;
      const lat = round5(c.centroid.lat);
      const lng = round5(c.centroid.lng);
      const stage = {
        id,
        name: c.members[0].name,
        lat,
        lng,
        ...(lat >= CBD.latMin && lat <= CBD.latMax && lng >= CBD.lngMin && lng <= CBD.lngMax
          ? { cbd: true }
          : {}),
        ...(ALIASES[key] ? { aliases: ALIASES[key] } : {}),
      };
      stages.push(stage);
      for (const m of c.members) stageOfStop.set(m.id, id);
    }
  }

  // frequencies per trip → headway + operating window
  const freqByTrip = new Map();
  for (const f of gtfsFrequencies) {
    if (!freqByTrip.has(f.trip_id)) freqByTrip.set(f.trip_id, []);
    freqByTrip.get(f.trip_id).push(f);
  }

  // shapes grouped + ordered
  const shapeById = new Map();
  for (const p of gtfsShapes) {
    if (!shapeById.has(p.shape_id)) shapeById.set(p.shape_id, []);
    shapeById.get(p.shape_id).push({ seq: Number(p.shape_pt_sequence), pt: [Number(p.shape_pt_lon), Number(p.shape_pt_lat)] });
  }

  const routes = [];
  const shapes = {};
  let curatedHits = 0;
  for (const r of gtfsRoutes) {
    const trip = canonical.get(r.route_id);
    if (!trip) continue;
    const stageList = [];
    for (const { stop } of tripStops.get(trip.trip_id)) {
      const stageId = stageOfStop.get(stop);
      if (stageId && stageList[stageList.length - 1] !== stageId) stageList.push(stageId);
    }
    if (stageList.length < 2) continue;

    const override = CURATED.find((c) => c.number.test(r.route_short_name) && c.name.test(r.route_long_name));
    if (override) curatedHits++;

    const freqs = tripsByRoute.get(r.route_id).flatMap((t) => freqByTrip.get(t.trip_id) ?? []);
    const headways = freqs.map((f) => Math.round(Number(f.headway_secs) / 60)).filter((n) => n > 0);
    const starts = freqs.map((f) => f.start_time).sort();
    const ends = freqs.map((f) => f.end_time).sort();

    routes.push({
      id: r.route_id,
      number: r.route_short_name,
      nickname: r.route_long_name,
      corridor: r.route_long_name,
      sacco: override?.sacco ?? 'SACCO to verify',
      vehicleClass: 'mixed',
      stages: stageList,
      fare: override?.fare ?? DEFAULT_FARE,
      fareVerified: Boolean(override?.fare),
      headwayMin: headways.length ? [Math.min(...headways), Math.max(...headways)] : [5, 20],
      firstMat: starts.length ? fmt12h(starts[0]) : '5:00 AM',
      lastMat: ends.length ? fmt12h(ends[ends.length - 1]) : '10:00 PM',
    });

    const raw = shapeById.get(trip.shape_id);
    if (raw) {
      raw.sort((a, b) => a.seq - b.seq);
      shapes[r.route_id] = simplify(raw.map((x) => x.pt), SHAPE_TOLERANCE).map(([lng, lat]) => [round5(lng), round5(lat)]);
    }
  }

  // keep only stages actually referenced by emitted routes
  const referenced = new Set(routes.flatMap((r) => r.stages));
  const finalStages = stages.filter((s) => referenced.has(s.id));

  const network = {
    dataVersion: `digitalmatatus-${feedInfo.feed_start_date ?? ''}-${feedInfo.feed_end_date ?? ''}`,
    source: 'Digital Matatus (University of Nairobi C4D Lab) — digitalmatatus.com',
    generatedAt: new Date().toISOString().slice(0, 10),
    stages: finalStages.sort((a, b) => a.name.localeCompare(b.name)),
    routes: routes.sort((a, b) => a.number.localeCompare(b.number, 'en', { numeric: true })),
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const networkPath = join(OUT_DIR, 'network.json');
  const shapesPath = join(OUT_DIR, 'shapes.json');
  writeFileSync(networkPath, JSON.stringify(network));
  writeFileSync(shapesPath, JSON.stringify(shapes));

  const kb = (p) => (readFileSync(p).length / 1024).toFixed(0);
  const shapePts = Object.values(shapes).reduce((a, s) => a + s.length, 0);
  console.log(`
routes:        ${network.routes.length} (of ${gtfsRoutes.length} in feed)
stages:        ${network.stages.length} (merged from ${usedStopIds.size} stops)
cbd stages:    ${network.stages.filter((s) => s.cbd).length}
curated fares: ${curatedHits} routes
shapes:        ${Object.keys(shapes).length} routes, ${shapePts} pts (from ${gtfsShapes.length})
network.json:  ${kb(networkPath)} KB
shapes.json:   ${kb(shapesPath)} KB
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
