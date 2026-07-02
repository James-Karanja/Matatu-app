import { Suspense, lazy } from 'react';
import { routesById } from '../data/routes';
import { stagesById } from '../data/stages';

// MapLibre is ~270KB gzipped — keep it out of the first-load bundle and fetch
// it only when someone opens a route detail page.
const RouteMap = lazy(() => import('./RouteMap'));

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
        <h3>Fares (KES)</h3>
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
        Fares, stages and operators are indicative sample data pending field verification.
      </p>
    </div>
  );
}
