/* Stage 2 groundwork, shipped dark: the passive-contribution module.
   Strictly opt-in and LOCAL-ONLY — there is no upload endpoint and no
   network code here by design. When enabled, it senses coarse position
   updates while the app is open, keeps only a running count and the
   latest speed in memory, and shows the user exactly what a future
   contribution would look like. Coordinates are never persisted and
   never leave the device. */

const CONSENT_KEY = 'njia.contribute.v1';

export interface TracerStatus {
  points: number;
  lastSpeedKmh: number | null;
  moving: boolean;
}

export function contributionEnabled(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setContributionEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(CONSENT_KEY, 'on');
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* storage unavailable — treat as off */
  }
}

/** Starts sensing while the app is open. Returns a stop function. */
export function startTracer(onStatus: (s: TracerStatus) => void): () => void {
  if (!('geolocation' in navigator)) {
    onStatus({ points: 0, lastSpeedKmh: null, moving: false });
    return () => {};
  }

  let points = 0;
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      points += 1;
      const kmh = pos.coords.speed != null ? Math.round(pos.coords.speed * 3.6) : null;
      // In-vehicle heuristic mirrors the strategy: sustained >10 km/h.
      onStatus({ points, lastSpeedKmh: kmh, moving: (kmh ?? 0) > 10 });
    },
    () => {
      onStatus({ points, lastSpeedKmh: null, moving: false });
    },
    { enableHighAccuracy: false, maximumAge: 15000, timeout: 30000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
