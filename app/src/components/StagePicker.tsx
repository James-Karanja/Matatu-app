import { useRef, useState } from 'react';
import { STAGES, stagesById } from '../data/stages';

interface Props {
  label: string;
  value: string;
  onChange: (stageId: string) => void;
  exclude?: string;
}

export default function StagePicker({ label, value, onChange, exclude }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);

  const selected = value ? stagesById[value] : undefined;
  const q = query.trim().toLowerCase();
  const matches = STAGES.filter((s) => s.id !== exclude)
    .filter(
      (s) =>
        !q ||
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
              </button>
            </li>
          ))}
          {matches.length === 0 && <li className="no-match">No stage found</li>}
        </ul>
      )}
    </label>
  );
}
