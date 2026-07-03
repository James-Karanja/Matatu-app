import { useState } from 'react';
import type { MatatuRoute } from '../data/network';
import { composeReport, type FareCondition, type ReportKind } from '../lib/report';

const CONDITIONS: FareCondition[] = ['off-peak', 'peak', 'rain', 'night'];

export default function ReportSheet({ route }: { route: MatatuRoute }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ReportKind>('fare');
  const [farePaid, setFarePaid] = useState('');
  const [condition, setCondition] = useState<FareCondition>('peak');
  const [note, setNote] = useState('');
  const [done, setDone] = useState('');

  if (!open) {
    return (
      <button type="button" className="report-open" onClick={() => setOpen(true)}>
        Paid a different fare? Spotted an error? Report it
      </button>
    );
  }

  const report = composeReport(route, {
    kind,
    farePaid: kind === 'fare' ? Number(farePaid) || undefined : undefined,
    condition: kind === 'fare' ? condition : undefined,
    note,
  });
  const canSend = kind === 'edit' ? note.trim().length > 0 : Boolean(Number(farePaid));

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: report.title, text: report.body });
        setDone('Shared — asante!');
        return;
      }
      throw new Error('no share');
    } catch {
      try {
        await navigator.clipboard.writeText(report.body);
        setDone('Copied to clipboard — paste it anywhere.');
      } catch {
        setDone('Could not share on this device.');
      }
    }
  };

  return (
    <div className="card report-sheet">
      <h3>Report for route {route.number}</h3>
      <div className="chips">
        <button
          type="button"
          className={`chip ${kind === 'fare' ? 'chip-on' : ''}`}
          onClick={() => setKind('fare')}
        >
          Fare I paid
        </button>
        <button
          type="button"
          className={`chip ${kind === 'edit' ? 'chip-on' : ''}`}
          onClick={() => setKind('edit')}
        >
          Route / stage correction
        </button>
      </div>

      {kind === 'fare' && (
        <>
          <label className="picker">
            <span className="picker-label">Fare paid (KES)</span>
            <input
              type="number"
              inputMode="numeric"
              min="10"
              max="1000"
              placeholder="e.g. 80"
              value={farePaid}
              onChange={(e) => setFarePaid(e.target.value)}
            />
          </label>
          <div className="chips">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${condition === c ? 'chip-on' : ''}`}
                onClick={() => setCondition(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      <label className="picker">
        <span className="picker-label">{kind === 'fare' ? 'Note (optional)' : 'What should change?'}</span>
        <input
          placeholder={kind === 'fare' ? 'e.g. from Kencom, evening' : 'e.g. stage X is now called Y'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {done ? (
        <p className="report-done">{done}</p>
      ) : (
        <div className="report-actions">
          <a
            className={`btn ${canSend ? '' : 'btn-disabled'}`}
            href={canSend ? report.issueUrl : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={() => canSend && setDone('Thanks — finish posting it on GitHub.')}
          >
            Send on GitHub
          </a>
          <button type="button" className="btn btn-secondary" disabled={!canSend} onClick={share}>
            Share…
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      )}
      <p className="meta">
        Nothing is sent automatically — you choose where the report goes. Reports carry no
        personal data.
      </p>
    </div>
  );
}
