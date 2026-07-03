import { useEffect, useState } from 'react';
import FindTrip from './components/FindTrip';
import RouteList from './components/RouteList';
import RouteDetail from './components/RouteDetail';
import About from './components/About';

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const TABS: Array<[href: string, label: string]> = [
  ['#/', 'Find'],
  ['#/routes', 'Routes'],
  ['#/about', 'About'],
];

export default function App() {
  const hash = useHash();
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const onUpdate = () => setUpdateReady(true);
    window.addEventListener('njia:sw-update', onUpdate);
    return () => window.removeEventListener('njia:sw-update', onUpdate);
  }, []);

  const routeMatch = hash.match(/^#\/route\/(.+)$/);
  const activeTab = routeMatch ? '#/routes' : hash === '#/routes' || hash === '#/about' ? hash : '#/';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Njia</h1>
        <p>Matatu routes, stages &amp; fares · Nairobi</p>
      </header>
      <main>
        {routeMatch ? (
          <RouteDetail routeId={decodeURIComponent(routeMatch[1])} />
        ) : hash === '#/routes' ? (
          <RouteList />
        ) : hash === '#/about' ? (
          <About />
        ) : (
          <FindTrip fromId={fromId} toId={toId} setFromId={setFromId} setToId={setToId} />
        )}
      </main>
      {updateReady && (
        <div className="update-toast" role="status">
          <span>A new version is ready.</span>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      )}
      <nav className="bottom-nav">
        {TABS.map(([href, label]) => (
          <a key={href} href={href} className={activeTab === href ? 'active' : ''}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
