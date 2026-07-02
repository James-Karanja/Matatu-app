import { useEffect, useRef } from 'react';
import maplibregl, { type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { stagesById } from '../data/stages';
import type { MatatuRoute } from '../data/routes';

/* Straight segments between stages for now — real driven route shapes will
   replace these once field mapping starts. OSM raster tiles layer over a
   plain backdrop, so the route stays visible when tiles can't load. */

export default function RouteMap({ route }: { route: MatatuRoute }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const coords = route.stages.map((id) => {
      const s = stagesById[id];
      return [s.lng, s.lat] as [number, number];
    });
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );

    const style = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
        'route-line': {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coords },
          },
        },
        'stage-points': {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: route.stages.map((id, i) => {
              const s = stagesById[id];
              return {
                type: 'Feature',
                properties: {
                  name: s.name,
                  terminal: i === 0 || i === route.stages.length - 1,
                },
                geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
              };
            }),
          },
        },
      },
      layers: [
        { id: 'backdrop', type: 'background', paint: { 'background-color': '#dfe7e2' } },
        { id: 'osm', type: 'raster', source: 'osm' },
        {
          id: 'line-casing',
          type: 'line',
          source: 'route-line',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 8 },
        },
        {
          id: 'line',
          type: 'line',
          source: 'route-line',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#046A38', 'line-width': 4.5 },
        },
        {
          id: 'stage-dots',
          type: 'circle',
          source: 'stage-points',
          paint: {
            'circle-radius': ['case', ['get', 'terminal'], 7, 5],
            'circle-color': ['case', ['get', 'terminal'], '#046A38', '#ffffff'],
            'circle-stroke-color': ['case', ['get', 'terminal'], '#ffffff', '#046A38'],
            'circle-stroke-width': 2.5,
          },
        },
      ],
    } as StyleSpecification;

    const map = new maplibregl.Map({
      container,
      style,
      bounds,
      fitBoundsOptions: { padding: 48 },
      attributionControl: { compact: true },
      cooperativeGestures: true,
    });

    map.on('click', 'stage-dots', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
      new maplibregl.Popup({ closeButton: false, offset: 10 })
        .setLngLat([lng, lat])
        .setText(String(feature.properties?.name ?? ''))
        .addTo(map);
    });
    map.on('mouseenter', 'stage-dots', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'stage-dots', () => {
      map.getCanvas().style.cursor = '';
    });

    // Terminal name chips as DOM markers — no glyph server needed, so labels
    // still render fully offline.
    [0, route.stages.length - 1].forEach((i) => {
      const s = stagesById[route.stages[i]];
      const chip = document.createElement('div');
      chip.className = 'map-chip';
      chip.textContent = s.name;
      new maplibregl.Marker({ element: chip, anchor: 'bottom', offset: [0, -12] })
        .setLngLat([s.lng, s.lat])
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [route]);

  return <div className="route-map" ref={containerRef} />;
}
