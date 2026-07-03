import { useMemo } from 'react';
import { ROUTES, stagesById, findStageByName, type Stage } from '../data/network';
import { planTrips, type Leg, type Trip } from '../lib/planner';
import StagePicker from './StagePicker';

interface Props {
  fromId: string;
  toId: string;
  setFromId: (id: string) => void;
  setToId: (id: string) => void;
}

/* Well-known trips, resolved against whatever the current network data
   calls those stages; pairs that don't resolve are simply not shown. */
const POPULAR: Array<{ from: Stage; to: Stage }> = (
  [
    ['Kencom', 'Kawangware'],
    ['Odeon', 'Thika'],
    ['Railways', 'Rongai'],
    ['Ambassadeur', 'Umoja'],
  ] as Array<[string, string]>
)
  .map(([f, t]) => ({ from: findStageByName(f), to: findStageByName(t) }))
  .filter((p): p is { from: Stage; to: Stage } => Boolean(p.from && p.to));

function LegRow({ leg, step }: { leg: Leg; step: number }) {
  return (
    <div className="leg-row">
      <span className="leg-step">{step}</span>
      <a className="route-badge" href={`#/route/${leg.route.id}`}>
        {leg.route.number}
      </a>
      <span className="leg-text">
        {leg.board.name} → {leg.alight.name} · {leg.stops} stops
      </span>
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  if (trip.kind === 'direct') {
    const { route, board, alight, stops } = trip.leg;
    return (
      <a className="card trip-card" href={`#/route/${route.id}`}>
        <span className="route-badge">{route.number}</span>
        <div className="trip-body">
          <div className="trip-title">{route.nickname}</div>
          <div className="trip-sub">
            Board {board.name} · alight {alight.name} · {stops} stops
          </div>
          <div className="trip-fare">
            KES {route.fare.offPeak[0]}–{route.fare.peak[1]}
            <span> · mat every {route.headwayMin[0]}–{route.headwayMin[1]} min</span>
          </div>
        </div>
      </a>
    );
  }

  const [l1, l2] = trip.legs;
  const fareMin = l1.route.fare.offPeak[0] + l2.route.fare.offPeak[0];
  const fareMax = l1.route.fare.peak[1] + l2.route.fare.peak[1];
  return (
    <div className="card trip-card transfer">
      <div className="transfer-tag">
        1 transfer{trip.walkTransfer ? ' · short walk in CBD' : ''}
      </div>
      <LegRow leg={l1} step={1} />
      <div className="transfer-note">
        {trip.walkTransfer
          ? `Alight ${l1.alight.name}, walk to ${l2.board.name} (~5–10 min)`
          : `Change at ${l1.alight.name}`}
      </div>
      <LegRow leg={l2} step={2} />
      <div className="trip-fare">
        ≈ KES {fareMin}–{fareMax} total
      </div>
    </div>
  );
}

export default function FindTrip({ fromId, toId, setFromId, setToId }: Props) {
  const trips = useMemo(() => planTrips(fromId, toId, ROUTES, stagesById), [fromId, toId]);

  return (
    <div className="find">
      <div className="card search-card">
        <StagePicker label="From stage" value={fromId} onChange={setFromId} exclude={toId} />
        <button
          type="button"
          className="swap-btn"
          aria-label="Swap from and to"
          onClick={() => {
            setFromId(toId);
            setToId(fromId);
          }}
        >
          ⇅
        </button>
        <StagePicker label="To stage" value={toId} onChange={setToId} exclude={fromId} />
      </div>

      {fromId && toId && trips.length === 0 && (
        <p className="empty">
          No mapped route between these stages yet — more routes are being mapped.
        </p>
      )}
      {trips.map((t, i) => (
        <TripCard key={i} trip={t} />
      ))}

      {!fromId && !toId && POPULAR.length > 0 && (
        <div className="popular">
          <h3>Popular trips</h3>
          <div className="chips">
            {POPULAR.map(({ from, to }) => (
              <button
                key={from.id + to.id}
                type="button"
                className="chip"
                onClick={() => {
                  setFromId(from.id);
                  setToId(to.id);
                }}
              >
                {from.name} → {to.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
