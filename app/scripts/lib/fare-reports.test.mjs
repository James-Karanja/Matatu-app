import { describe, expect, it } from 'vitest';
import { parseReportBody, aggregateReports } from './fare-reports.mjs';

const body = (routeId, fare, condition) =>
  `Route: 46K — Kencom-Kawangware\nRoute id: ${routeId}\nReport type: fare paid\nFare paid: KES ${fare}\nCondition: ${condition}\nData version: x\nReported: 2026-07-03`;

describe('parseReportBody', () => {
  it('parses a well-formed fare report', () => {
    expect(parseReportBody('Fare report: route 46K — KES 80', body('60200004611', 80, 'peak'))).toEqual({
      routeId: '60200004611',
      farePaid: 80,
      condition: 'peak',
    });
  });

  it('rejects non-fare issues, bad amounts, and unknown conditions', () => {
    expect(parseReportBody('Data correction: route 46K', body('x', 80, 'peak'))).toBeNull();
    expect(parseReportBody('Fare report: r', body('x', 9, 'peak'))).toBeNull();
    expect(parseReportBody('Fare report: r', body('x', 5000, 'peak'))).toBeNull();
    expect(parseReportBody('Fare report: r', body('x', 80, 'whenever'))).toBeNull();
    expect(parseReportBody('Fare report: r', 'free text with no structure')).toBeNull();
  });
});

describe('aggregateReports', () => {
  const r = (routeId, farePaid, condition) => ({ routeId, farePaid, condition });

  it('requires the minimum number of reports per route', () => {
    const out = aggregateReports([r('A', 80, 'peak'), r('A', 90, 'peak')], 3);
    expect(out).toEqual({});
  });

  it('builds bands per condition and trims outliers', () => {
    const reports = [
      r('A', 70, 'off-peak'),
      r('A', 80, 'off-peak'),
      r('A', 80, 'off-peak'),
      r('A', 500, 'off-peak'), // outlier / typo
      r('A', 100, 'peak'),
      r('A', 120, 'peak'),
      r('A', 200, 'rain'),
    ];
    const out = aggregateReports(reports, 3);
    expect(out.A.reports).toBe(7);
    expect(out.A.fare.offPeak[0]).toBeGreaterThanOrEqual(70);
    expect(out.A.fare.offPeak[1]).toBeLessThan(500);
    expect(out.A.fare.peak).toEqual([102, 118]);
    expect(out.A.fare.rainMax).toBe(200);
  });

  it('skips null parses', () => {
    expect(aggregateReports([null, null], 1)).toEqual({});
  });
});
