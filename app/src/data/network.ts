/* Typed accessor over the generated network data.
   network.json is produced by scripts/ingest-gtfs.mjs from the Digital
   Matatus Nairobi GTFS feed — regenerate with:
     node scripts/ingest-gtfs.mjs --download */

import networkJson from './network.json';

export interface Stage {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cbd?: boolean;
  aliases?: string[];
}

export interface FareBand {
  offPeak: [number, number];
  peak: [number, number];
  rainMax: number;
}

export interface MatatuRoute {
  id: string;
  number: string;
  nickname: string;
  corridor: string;
  sacco: string;
  vehicleClass: string;
  stages: string[];
  fare: FareBand;
  fareVerified: boolean;
  headwayMin: [number, number];
  firstMat: string;
  lastMat: string;
  notes?: string;
}

interface Network {
  dataVersion: string;
  source: string;
  generatedAt: string;
  stages: Stage[];
  routes: MatatuRoute[];
}

const network = networkJson as unknown as Network;

export const DATA_VERSION = network.dataVersion;
export const DATA_SOURCE = network.source;
export const GENERATED_AT = network.generatedAt;
export const STAGES: Stage[] = network.stages;
export const ROUTES: MatatuRoute[] = network.routes;

export const stagesById: Record<string, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
);
export const routesById: Record<string, MatatuRoute> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r])
);

/* Route numbers serving each stage — shown in the picker so same-named
   stages in different places are distinguishable. */
export const routeNumbersByStage: Record<string, string[]> = {};
for (const r of ROUTES) {
  for (const id of r.stages) {
    (routeNumbersByStage[id] ??= []).push(r.number);
  }
}

export function findStageByName(query: string): Stage | undefined {
  const q = query.toLowerCase();
  return (
    STAGES.find((s) => s.name.toLowerCase() === q) ??
    STAGES.find((s) => s.name.toLowerCase().startsWith(q)) ??
    STAGES.find((s) => s.name.toLowerCase().includes(q))
  );
}
