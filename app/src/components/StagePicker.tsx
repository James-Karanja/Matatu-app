import { useRef, useState } from 'react';
import { STAGES, stagesById, routeNumbersByStage } from '../data/network';

interface Props {
  label: string;
  value: string;
  onChange: (stageId: string) => void;
  exclude?: string;
}

const MIN_CHARS = 2;

function routeContext(stageId: string): string {
  const numbers = routeNumbersByStage[stageId] ?? [];
  if (numbers.length === 0) return '';
  const shown = numbers.slice(0, 4).join(', ');
  return numbers.length > 4 ? `${shown} +${numbers.length - 4}` : shown;
}

export default function StagePicker({ label, value, onChange, exclude }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);

  const selected = value ? stagesById[value] : undefined;
  const q = query.trim().toLowerCase();
  const matches =
    q.length < MIN_CHARS
      ? []
      : STAGES.filter((s) => s.id !== exclude)
          .filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              (s.aliases ?? []).some((a) => a.toLowerCase().includes(q))
          )
          .slice(0, 8);

  return (
    <label className="picker">
      <span className="picker-label">{label}</span>
      <input
        value={open ? query : selected?.name ?? ''}
        placeholder="Search a stage…"
        onFocus={() => {
          window.clearTimeout(blurTimer.current);
          setQuery('');
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <ul className="picker-list">
          {matches.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
              >
                {s.name}
                {s.cbd && <em> · CBD</em>}
                <span className="picker-routes">{routeContext(s.id)}</span>
              </button>
            </li>
          ))}
          {q.length < MIN_CHARS && (
            <li className="no-match">Type at least {MIN_CHARS} letters…</li>
          )}
          {q.length >= MIN_CHARS && matches.length === 0 && (
            <li className="no-match">No stage found</li>
          )}
        </ul>
      )}
    </label>
  );
}
