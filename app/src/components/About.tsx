import { DATA_VERSION, GENERATED_AT, ROUTES, STAGES } from '../data/network';

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
          show a typical range until our fare verification catches up. Spot something wrong?
          A report-a-fare feature is coming next.
        </p>
        <p className="meta">
          Data version: {DATA_VERSION} · imported {GENERATED_AT}
        </p>
      </div>

      <div className="card">
        <h3>Privacy</h3>
        <p>
          This app collects <strong>no location data and no personal data</strong>. If that
          ever changes (for live matatu positions), it will be strictly opt-in and clearly
          explained first.
        </p>
      </div>

      <div className="card">
        <h3>Coming next</h3>
        <ul className="plain-list">
          <li>Report a fare / suggest a route correction</li>
          <li>Fresh field verification of stages and fares</li>
          <li>Live matatu positions, corridor by corridor</li>
        </ul>
      </div>
    </div>
  );
}
