import { useEffect, useState } from 'react';
import { DATA_VERSION, GENERATED_AT, ROUTES, STAGES } from '../data/network';
import {
  contributionEnabled,
  setContributionEnabled,
  startTracer,
  type TracerStatus,
} from '../lib/tracer';

function ContributeCard() {
  const [enabled, setEnabled] = useState(contributionEnabled());
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<TracerStatus | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus(null);
      return;
    }
    return startTracer(setStatus);
  }, [enabled]);

  return (
    <div className="card">
      <h3>Live matatu data (preview)</h3>
      <p>
        One day, phones like yours will power a live map of where mats are — anonymously,
        together. That system is not built yet. This preview only shows what your phone{' '}
        <em>would</em> contribute: <strong>nothing leaves your phone.</strong>
      </p>
      {!enabled && !confirming && (
        <button type="button" className="btn btn-secondary" onClick={() => setConfirming(true)}>
          Try the preview
        </button>
      )}
      {!enabled && confirming && (
        <div className="consent">
          <p>
            <strong>If you turn this on:</strong>
          </p>
          <ul className="plain-list">
            <li>Your phone senses its position only while the app is open</li>
            <li>It keeps a count and your current speed — on your phone only</li>
            <li>Nothing is uploaded. There is no server. Coordinates are not stored</li>
            <li>Turn it off any time with one tap</li>
          </ul>
          <p className="meta">Hakuna data inayotoka kwenye simu yako — jaribio tu.</p>
          <div className="report-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setContributionEnabled(true);
                setEnabled(true);
                setConfirming(false);
              }}
            >
              Turn on preview
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Not now
            </button>
          </div>
        </div>
      )}
      {enabled && (
        <div className="consent">
          <p className="tracer-status">
            Sensed this session: <strong>{status?.points ?? 0} points</strong>
            {status?.lastSpeedKmh != null && <> · {status.lastSpeedKmh} km/h</>}
            {status?.moving && <> · looks like you&apos;re in a vehicle 🚌</>}
            <br />
            Uploaded: <strong>0 — upload does not exist yet.</strong>
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setContributionEnabled(false);
              setEnabled(false);
            }}
          >
            Turn off
          </button>
        </div>
      )}
    </div>
  );
}

export default function About() {
  return (
    <div className="about">
      <div className="card">
        <h3>What is Njia?</h3>
        <p>
          Njia maps <strong>actual matatu routes</strong> — the stages by their real names, the
          paths mats really drive, and fares as honest ranges (peak, off-peak, and when it
          rains). Not the driving directions Google shows: the network Nairobi actually uses.
        </p>
        <p>
          It works offline once loaded, and you can install it to your home screen from your
          browser menu.
        </p>
      </div>

      <div className="card">
        <h3>About the data</h3>
        <p>
          Routes, stages and headways come from the open{' '}
          <strong>Digital Matatus</strong> dataset ({ROUTES.length} routes,{' '}
          {STAGES.length} stages) — the pioneering mapping of Nairobi&apos;s matatu network by
          the University of Nairobi C4DLab, Columbia University and MIT&apos;s Civic Data
          Design Lab. See digitalmatatus.com.
        </p>
        <p>
          Fares are indicative ranges: a few corridors carry field-checked samples, the rest
          show a typical range until fare verification catches up. Paid something different?
          Open any route and tap <em>Report it</em>.
        </p>
        <p className="meta">
          Data version: {DATA_VERSION} · imported {GENERATED_AT}
        </p>
      </div>

      <ContributeCard />

      <div className="card">
        <h3>Privacy</h3>
        <p>
          This app collects <strong>no location data and no personal data</strong>. The
          preview above senses position only if you switch it on, keeps everything on your
          phone, and uploads nothing. Any future live-data feature will be strictly opt-in
          and clearly explained first.
        </p>
      </div>

      <div className="card">
        <h3>Coming next</h3>
        <ul className="plain-list">
          <li>Fresh field verification of stages and fares</li>
          <li>Crowdsourced fare updates rolled into the data</li>
          <li>Live matatu positions, corridor by corridor</li>
        </ul>
        <p className="meta">
          Street team? <a href="#/posters">Generate a stage poster →</a>
        </p>
      </div>
    </div>
  );
}
