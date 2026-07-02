import { DATA_VERSION, ROUTES } from '../data/routes';
import { STAGES } from '../data/stages';

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
          This early version carries <strong>{ROUTES.length} routes and {STAGES.length} stages
          of sample data</strong> while our mappers ride and verify every route. Fares, stage
          positions and operators are indicative until then.
        </p>
        <p className="meta">Data version: {DATA_VERSION}</p>
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
          <li>Full Nairobi network, then Mombasa &amp; Kisumu</li>
          <li>Live matatu positions, corridor by corridor</li>
        </ul>
      </div>
    </div>
  );
}
