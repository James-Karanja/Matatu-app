import { useEffect, useState } from 'react';
import { stagesById } from '../data/network';
import { renderPoster } from '../lib/poster';
import StagePicker from './StagePicker';

export default function PosterPage() {
  const [stageId, setStageId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!stageId) return;
    let cancelled = false;
    setBusy(true);
    renderPoster(stagesById[stageId])
      .then((blob) => {
        if (cancelled) return;
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
      })
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [stageId]);

  return (
    <div className="poster-page">
      <div className="card">
        <h3>Stage poster generator</h3>
        <p>
          Pick a stage to generate a printable A4 poster with a QR code to the app — for the
          street team to put up at termini.
        </p>
        <StagePicker label="Stage" value={stageId} onChange={setStageId} />
      </div>
      {busy && <p className="empty">Generating poster…</p>}
      {previewUrl && !busy && (
        <>
          <img className="poster-preview" src={previewUrl} alt="Stage poster preview" />
          <a
            className="btn poster-download"
            href={previewUrl}
            download={`njia-poster-${stagesById[stageId].name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`}
          >
            Download poster (PNG)
          </a>
        </>
      )}
    </div>
  );
}
