import { ROUTES } from '../data/routes';
import { stagesById } from '../data/stages';

export default function RouteList() {
  const sorted = [...ROUTES].sort((a, b) => Number(a.number) - Number(b.number));

  return (
    <div className="route-list">
      <p className="hint">
        {ROUTES.length} routes mapped · sample data, field verification in progress
      </p>
      {sorted.map((r) => {
        const first = stagesById[r.stages[0]];
        const last = stagesById[r.stages[r.stages.length - 1]];
        return (
          <a key={r.id} className="card trip-card" href={`#/route/${r.id}`}>
            <span className="route-badge">{r.number}</span>
            <div className="trip-body">
              <div className="trip-title">
                {first.name} ↔ {last.name}
              </div>
              <div className="trip-sub">
                {r.corridor} · {r.stages.length} stages · {r.sacco}
              </div>
              <div className="trip-fare">
                KES {r.fare.offPeak[0]}–{r.fare.peak[1]}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
