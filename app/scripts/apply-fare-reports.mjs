#!/usr/bin/env node
/**
 * Pulls "Fare report:" issues from the repo, aggregates them, and updates
 * the app's fare data. Maintainer-driven by design: run it, review the
 * git diff, commit — crowd data never ships without a human look.
 *
 * Usage:
 *   node scripts/apply-fare-reports.mjs [--min 3] [--repo owner/name]
 *   node scripts/apply-fare-reports.mjs --from-file issues.json   # offline/dry runs
 *
 * Writes:
 *   src/data/fare-overrides.json — the durable crowd-fare record, also
 *     consumed by scripts/ingest-gtfs.mjs on future feed regenerations
 *   src/data/network.json        — fares patched in place (fareVerified)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReportBody, aggregateReports } from './lib/fare-reports.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'src', 'data');

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const MIN_REPORTS = Number(argOf('--min', '3'));
const REPO = argOf('--repo', 'James-Karanja/Matatu-app');

async function fetchAllIssues() {
  const issues = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&page=${page}`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) throw new Error(`GitHub API: HTTP ${res.status}`);
    const batch = await res.json();
    issues.push(...batch.filter((i) => !i.pull_request));
    if (batch.length < 100) break;
  }
  return issues;
}

const fromFile = argOf('--from-file', '');
const issues = fromFile ? JSON.parse(readFileSync(fromFile, 'utf8')) : await fetchAllIssues();
const parsed = issues.map((i) => parseReportBody(i.title, i.body));
const valid = parsed.filter(Boolean);
const overrides = aggregateReports(valid, MIN_REPORTS);

const overridesPath = join(DATA, 'fare-overrides.json');
const existing = JSON.parse(readFileSync(overridesPath, 'utf8'));
const today = new Date().toISOString().slice(0, 10);
for (const [routeId, o] of Object.entries(overrides)) {
  existing[routeId] = { ...o, updated: today };
}
writeFileSync(overridesPath, JSON.stringify(existing, null, 2) + '\n');

const networkPath = join(DATA, 'network.json');
const network = JSON.parse(readFileSync(networkPath, 'utf8'));
let patched = 0;
for (const route of network.routes) {
  const o = existing[route.id];
  if (!o) continue;
  route.fare = { ...route.fare, ...o.fare };
  route.fareVerified = true;
  patched++;
}
writeFileSync(networkPath, JSON.stringify(network));

console.log(`issues fetched:     ${issues.length}
fare reports valid: ${valid.length} (of ${parsed.length} fare-report-shaped)
routes qualifying:  ${Object.keys(overrides).length} (min ${MIN_REPORTS} reports)
routes patched:     ${patched}

Review the diff (git diff src/data) before committing.`);
