/* Trip planner over the static route network.
   Matatus serve the same stages in both directions, so a route "connects"
   two stages regardless of order. Transfers model the two real patterns:
   changing at a shared stage, or riding into the CBD and walking a few
   minutes to another terminus (most cross-town trips work this way). */

import type { MatatuRoute, Stage } from '../data/network';

export interface Leg {
  route: MatatuRoute;
  board: Stage;
  alight: Stage;
  stops: number;
}

export interface DirectTrip {
  kind: 'direct';
  leg: Leg;
}

export interface TransferTrip {
  kind: 'transfer';
  legs: [Leg, Leg];
  walkTransfer: boolean; // true = alight in CBD, short walk to the other terminus
}

export type Trip = DirectTrip | TransferTrip;

function makeLeg(
  route: MatatuRoute,
  fromId: string,
  toId: string,
  stagesById: Record<string, Stage>
): Leg {
  const i = route.stages.indexOf(fromId);
  const j = route.stages.indexOf(toId);
  return {
    route,
    board: stagesById[fromId],
    alight: stagesById[toId],
    stops: Math.abs(j - i),
  };
}

export function planTrips(
  fromId: string,
  toId: string,
  routes: MatatuRoute[],
  stagesById: Record<string, Stage>
): Trip[] {
  if (!fromId || !toId || fromId === toId) return [];

  const direct: DirectTrip[] = routes
    .filter((r) => r.stages.includes(fromId) && r.stages.includes(toId))
    .map((r) => ({ kind: 'direct' as const, leg: makeLeg(r, fromId, toId, stagesById) }))
    .sort((a, b) => a.leg.stops - b.leg.stops);
  if (direct.length > 0) return direct;

  const fromRoutes = routes.filter((r) => r.stages.includes(fromId));
  const toRoutes = routes.filter((r) => r.stages.includes(toId));
  const transfers: TransferTrip[] = [];

  const stageSets = new Map(toRoutes.map((r) => [r.id, new Set(r.stages)]));
  for (const a of fromRoutes) {
    for (const b of toRoutes) {
      if (a.id === b.id) continue;

      const bStages = stageSets.get(b.id)!;
      const shared = a.stages.filter(
        (s) => s !== fromId && s !== toId && bStages.has(s)
      );
      if (shared.length > 0) {
        const best = shared
          .map((s) => ({
            s,
            cost:
              makeLeg(a, fromId, s, stagesById).stops +
              makeLeg(b, s, toId, stagesById).stops,
          }))
          .sort((x, y) => x.cost - y.cost)[0].s;
        transfers.push({
          kind: 'transfer',
          legs: [makeLeg(a, fromId, best, stagesById), makeLeg(b, best, toId, stagesById)],
          walkTransfer: false,
        });
      } else {
        const aCbd = a.stages.find((s) => s !== fromId && stagesById[s].cbd);
        const bCbd = b.stages.find((s) => s !== toId && stagesById[s].cbd);
        if (aCbd && bCbd) {
          transfers.push({
            kind: 'transfer',
            legs: [makeLeg(a, fromId, aCbd, stagesById), makeLeg(b, bCbd, toId, stagesById)],
            walkTransfer: true,
          });
        }
      }
    }
  }

  transfers.sort(
    (x, y) =>
      Number(x.walkTransfer) - Number(y.walkTransfer) ||
      x.legs[0].stops + x.legs[1].stops - (y.legs[0].stops + y.legs[1].stops)
  );
  return transfers.slice(0, 4);
}
