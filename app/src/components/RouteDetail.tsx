import { Suspense, lazy, useState } from 'react';
import { routesById, stagesById, type MatatuRoute } from '../data/network';
import ReportSheet from './ReportSheet';
import { shareRouteCard } from '../lib/routeCard';

// MapLibre is ~270KB gzipped — keep it out of the first-load bundle and fetch
// it only when someone opens a route detail page.
const RouteMap = lazy(() => import('./RouteMap'));

function ShareCardButton({ route }: { route: MatatuRoute }) {
  const [state, setState] = useState<'idle' | 'busy' | 'shared' | 'downloaded' | 'failed'>('idle');
  const onShare = async () => {
    setState('busy');
    try {
      // shapes.json rides the lazy map chunk; pull it the same way here
      const shapes = (await import('../data/shapes.json')).default as unknown as Record<
        string,
        [number, number][]
      >;
      setState(await shareRouteCard(route, shapes[route.id]));
    } catch {
      setState('failed');
    }
  };
  const label =
    state === 'busy'
      ? 'Preparing card…'
      : state === 'shared'
        ? 'Shared — asante!'
        : state === 'downloaded'
          ? 'Card saved — share it anywhere'
          : state === 'failed'
            ? 'Could not create the card'
            : 'Share this route as a card';
  return (
    <button type="button" className="share-card-btn" onClick={onShare} disabled={state === 'busy'}>
      {label}
    </button>
  );
}

export default function RouteDetail({ routeId }: { routeId: string }) {
  const route = routesById[routeId];
  if (!route) {
    return (
      <div className="card">
        Route not found. <a href="#/routes">See all routes</a>
      </div>
    );
  }

  const first = stagesById[route.stages[0]];
  const last = stagesById[route.stages[route.stages.length - 1]];

  return (
    <div className="route-detail">
      <a className="back-link" href="#/routes">
        ← All routes
      </a>

      <div className="card detail-head">
        <span className="route-badge big">{route.number}</span>
        <div>
          <h2>
            {first.name} ↔ {last.name}
          </h2>
          <p>
            {route.corridor} · {route.sacco} · {route.vehicleClass}
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="route-map map-loading">Loading map…</div>}>
        <RouteMap route={route} />
      </Suspense>

      <div className="card">
        <h3>
          Fares (KES)
          {!route.fareVerified && <span className="fare-tag">typical range · to verify</span>}
        </h3>
        <table className="fare-table">
          <tbody>
            <tr>
              <td>Off-peak</td>
              <td>
                {route.fare.offPeak[0]}–{route.fare.offPeak[1]}
              </td>
            </tr>
            <tr>
              <td>Peak (6–9am · 4–8pm)</td>
              <td>
                {route.fare.peak[0]}–{route.fare.peak[1]}
              </td>
            </tr>
            <tr>
              <td>Rain / late night</td>
              <td>up to {route.fare.rainMax}</td>
            </tr>
          </tbody>
        </table>
        <p className="meta">
          Mat every {route.headwayMin[0]}–{route.headwayMin[1]} min · first ~{route.firstMat} ·
          last ~{route.lastMat}
        </p>
        {route.notes && <p className="note">{route.notes}</p>}
      </div>

      <ShareCardButton route={route} />

      <ReportSheet route={route} />

      <div className="card">
        <h3>Stages ({route.stages.length})</h3>
        <ol className="stage-list">
          {route.stages.map((id) => {
            const s = stagesById[id];
            return (
              <li key={id}>
                <span className="dot" />
                {s.name}
                {s.cbd && <span className="cbd-tag">CBD</span>}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="disclaimer">
        Route and stage data: Digital Matatus (digitalmatatus.com). Fares and operators are
        indicative pending field verification.
      </p>
    </div>
  );
}
