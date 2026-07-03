/* Pure logic for the fare-report pipeline: parse the structured report
   bodies that the in-app ReportSheet generates (as GitHub issues), and
   aggregate them into fare overrides once enough independent reports
   agree. Kept dependency-free and separate from I/O so it's unit-testable. */

const CONDITIONS = ['off-peak', 'peak', 'rain', 'night'];

/** Parses one issue into { routeId, farePaid, condition } or null. */
export function parseReportBody(title, body) {
  if (!/^Fare report:/i.test(title ?? '')) return null;
  const get = (label) => {
    const m = (body ?? '').match(new RegExp(`^${label}:\\s*(.+)$`, 'mi'));
    return m ? m[1].trim() : undefined;
  };
  const routeId = get('Route id');
  const fareRaw = get('Fare paid');
  const condition = (get('Condition') ?? '').toLowerCase();
  const farePaid = fareRaw ? Number(fareRaw.replace(/[^\d.]/g, '')) : NaN;
  if (!routeId || !Number.isFinite(farePaid) || farePaid < 10 || farePaid > 1000) return null;
  if (!CONDITIONS.includes(condition)) return null;
  return { routeId, farePaid, condition };
}

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

/** Aggregates parsed reports into per-route fare overrides.
    A route qualifies once it has >= minReports reports in total.
    Bands are the middle 80% of reported values per condition — a few
    typos or outliers can't drag the range. */
export function aggregateReports(reports, minReports = 3) {
  const byRoute = new Map();
  for (const r of reports) {
    if (!r) continue;
    if (!byRoute.has(r.routeId)) byRoute.set(r.routeId, []);
    byRoute.get(r.routeId).push(r);
  }

  const overrides = {};
  for (const [routeId, list] of byRoute) {
    if (list.length < minReports) continue;
    const band = (conds) => {
      const values = list
        .filter((r) => conds.includes(r.condition))
        .map((r) => r.farePaid)
        .sort((a, b) => a - b);
      if (values.length === 0) return undefined;
      return [quantile(values, 0.1), quantile(values, 0.9)];
    };
    const offPeak = band(['off-peak']);
    const peak = band(['peak']);
    const rain = band(['rain', 'night']);
    const fare = {};
    if (offPeak) fare.offPeak = offPeak;
    if (peak) fare.peak = peak;
    if (rain) fare.rainMax = rain[1];
    if (Object.keys(fare).length === 0) continue;
    overrides[routeId] = { fare, reports: list.length };
  }
  return overrides;
}
