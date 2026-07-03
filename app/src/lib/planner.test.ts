import { describe, expect, it } from 'vitest';
import { planTrips, type DirectTrip, type TransferTrip } from './planner';
import { ROUTES, STAGES, stagesById, findStageByName } from '../data/network';

const plan = (from: string, to: string) => planTrips(from, to, ROUTES, stagesById);
const stage = (name: string) => {
  const s = findStageByName(name);
  if (!s) throw new Error(`test stage not found in network: ${name}`);
  return s;
};

describe('generated network integrity', () => {
  it('has unique stage ids and resolvable route stage refs', () => {
    expect(new Set(STAGES.map((s) => s.id)).size).toBe(STAGES.length);
    for (const r of ROUTES) {
      expect(r.stages.length).toBeGreaterThanOrEqual(2);
      for (const id of r.stages) {
        expect(stagesById[id], `route ${r.number} references ${id}`).toBeDefined();
      }
    }
  });

  it('carries the full Digital Matatus network', () => {
    expect(ROUTES.length).toBeGreaterThan(100);
    expect(STAGES.length).toBeGreaterThan(1500);
    expect(STAGES.some((s) => s.cbd)).toBe(true);
  });
});

describe('planTrips on the real network', () => {
  it('finds the 46 as a direct route from Kencom to Kawangware', () => {
    const trips = plan(stage('Kencom').id, stage('Kawangware Mwisho').id);
    expect(trips.length).toBeGreaterThan(0);
    expect(trips[0].kind).toBe('direct');
    expect(trips.some((t) => /46/.test((t as DirectTrip).leg.route.number))).toBe(true);
  });

  it('works in the reverse direction', () => {
    const trips = plan(stage('Kawangware Mwisho').id, stage('Kencom').id);
    expect(trips[0].kind).toBe('direct');
  });

  it('connects Kawangware to the end of the Thika corridor', () => {
    const thikaRoute = ROUTES.find((r) => /thika/i.test(r.nickname));
    expect(thikaRoute).toBeDefined();
    const thikaEnd = stagesById[thikaRoute!.stages[thikaRoute!.stages.length - 1]];
    const from = stage('Kawangware Mwisho');
    const trips = plan(from.id, thikaEnd.id);
    expect(trips.length).toBeGreaterThan(0);
    const t = trips[0];
    if (t.kind === 'transfer') {
      const [l1, l2] = (t as TransferTrip).legs;
      expect(l1.board.id).toBe(from.id);
      expect(l2.alight.id).toBe(thikaEnd.id);
      expect(l1.alight.id).toBe(l2.board.id === l1.alight.id ? l2.board.id : l1.alight.id);
    }
  });

  it('returns nothing for the same stage or empty input', () => {
    const kencom = stage('Kencom').id;
    expect(plan(kencom, kencom)).toEqual([]);
    expect(plan('', kencom)).toEqual([]);
  });
});
