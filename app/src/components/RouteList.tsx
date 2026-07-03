import { useState } from 'react';
import { ROUTES, stagesById } from '../data/network';

export default function RouteList() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? ROUTES.filter(
        (r) => r.number.toLowerCase().includes(q) || r.nickname.toLowerCase().includes(q)
      )
    : ROUTES;

  return (
    <div className="route-list">
      <input
        className="filter-input"
        placeholder="Filter by route number or name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="hint">
        {filtered.length} of {ROUTES.length} routes · Digital Matatus data, field verification
        in progress
      </p>
      {filtered.map((r) => {
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
                {r.nickname} · {r.stages.length} stages
              </div>
              <div className="trip-fare">
                KES {r.fare.offPeak[0]}–{r.fare.peak[1]}
              </div>
            </div>
          </a>
        );
      })}
      {filtered.length === 0 && <p className="empty">No route matches “{query}”.</p>}
    </div>
  );
}
