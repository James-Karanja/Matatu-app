import { describe, expect, it } from 'vitest';
import { composeReport, REPO_URL } from './report';
import { ROUTES } from '../data/network';

const route = ROUTES[0];

describe('composeReport', () => {
  it('composes a fare report with amount and condition', () => {
    const r = composeReport(route, { kind: 'fare', farePaid: 80, condition: 'rain', note: 'after 7pm' });
    expect(r.title).toContain(route.number);
    expect(r.title).toContain('KES 80');
    expect(r.body).toContain(`Route id: ${route.id}`);
    expect(r.body).toContain('Fare paid: KES 80');
    expect(r.body).toContain('Condition: rain');
    expect(r.body).toContain('Note: after 7pm');
    expect(r.body).toContain('Data version:');
  });

  it('composes a correction report without fare fields', () => {
    const r = composeReport(route, { kind: 'edit', note: 'stage renamed' });
    expect(r.title).toContain('Data correction');
    expect(r.body).not.toContain('Fare paid');
    expect(r.body).toContain('Note: stage renamed');
  });

  it('builds a prefilled GitHub issue URL', () => {
    const r = composeReport(route, { kind: 'fare', farePaid: 100 });
    expect(r.issueUrl.startsWith(`${REPO_URL}/issues/new?title=`)).toBe(true);
    expect(decodeURIComponent(r.issueUrl)).toContain('Fare paid: KES 100');
  });
});
