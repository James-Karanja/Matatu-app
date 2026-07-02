import { describe, expect, it } from 'vitest';
import { planTrips, type DirectTrip, type TransferTrip } from './planner';
import { ROUTES } from '../data/routes';
import { stagesById } from '../data/stages';

const plan = (from: string, to: string) => planTrips(from, to, ROUTES, stagesById);

describe('planTrips', () => {
  it('finds a direct route from Kencom to Kawangware', () => {
    const trips = plan('kencom', 'kawangware');
    expect(trips.length).toBeGreaterThan(0);
    const first = trips[0] as DirectTrip;
    expect(first.kind).toBe('direct');
    expect(first.leg.route.number).toBe('46');
  });

  it('works in the reverse direction', () => {
    const trips = plan('kawangware', 'kencom');
    expect(trips[0].kind).toBe('direct');
    expect((trips[0] as DirectTrip).leg.route.number).toBe('46');
  });

  it('returns only direct options when a direct route exists', () => {
    const trips = plan('odeon', 'githurai');
    expect(trips.length).toBe(2); // routes 45 and 237 both serve both stages
    expect(trips.every((t) => t.kind === 'direct')).toBe(true);
  });

  it('suggests a CBD walk-transfer when routes share no stage', () => {
    const trips = plan('kawangware', 'thika');
    expect(trips.length).toBeGreaterThan(0);
    const t = trips[0] as TransferTrip;
    expect(t.kind).toBe('transfer');
    expect(t.walkTransfer).toBe(true);
    expect(t.legs[0].route.number).toBe('46');
    expect(t.legs[1].route.number).toBe('237');
  });

  it('prefers a shared-stage transfer over a CBD walk', () => {
    const trips = plan('rongai', 'ngong-town');
    const t = trips[0] as TransferTrip;
    expect(t.kind).toBe('transfer');
    expect(t.walkTransfer).toBe(false); // 125 and 111 share Railways
    expect(t.legs[0].alight.id).toBe('railways');
  });

  it('returns nothing for the same stage or empty input', () => {
    expect(plan('kencom', 'kencom')).toEqual([]);
    expect(plan('', 'kencom')).toEqual([]);
  });
});
