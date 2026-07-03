/* Renders a shareable route card as a PNG — the WhatsApp-native unit of
   the distribution strategy. Pure canvas, no dependencies; includes the
   route's real shape so the card is instantly recognizable. */

import { stagesById, type MatatuRoute } from '../data/network';

export const APP_URL = 'james-karanja.github.io/Matatu-app';

const W = 1080;
const H = 1350;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, basePx: number, weight = 800): number {
  let px = basePx;
  do {
    ctx.font = `${weight} ${px}px system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px -= 2;
  } while (px > 24);
  return px;
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  coords: [number, number][],
  box: { x: number; y: number; w: number; h: number }
) {
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const spanLng = Math.max(maxLng - minLng, 1e-6);
  const spanLat = Math.max(maxLat - minLat, 1e-6);
  const scale = Math.min(box.w / spanLng, box.h / spanLat) * 0.86;
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const midLng = (minLng + maxLng) / 2, midLat = (minLat + maxLat) / 2;
  const px = (c: [number, number]): [number, number] => [
    cx + (c[0] - midLng) * scale,
    cy - (c[1] - midLat) * scale,
  ];

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [color, width] of [
    ['#ffffff', 22],
    ['#046A38', 12],
  ] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    coords.forEach((c, i) => {
      const [x, y] = px(c);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  for (const end of [coords[0], coords[coords.length - 1]]) {
    const [x, y] = px(end);
    ctx.fillStyle = '#046A38';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.stroke();
  }
}

export async function renderRouteCard(
  route: MatatuRoute,
  shape?: [number, number][]
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f2f5f2';
  ctx.fillRect(0, 0, W, H);

  // header band
  const grad = ctx.createLinearGradient(0, 0, W, 190);
  grad.addColorStop(0, '#046A38');
  grad.addColorStop(1, '#03502b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 190);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 64px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Njia', 60, 105);
  ctx.font = '400 34px system-ui, sans-serif';
  ctx.globalAlpha = 0.85;
  ctx.fillText('Matatu routes, stages & fares · Nairobi', 60, 155);
  ctx.globalAlpha = 1;

  // route number plate
  ctx.fillStyle = '#131313';
  const plateW = Math.max(240, ctx.measureText(route.number).width + 120);
  roundRect(ctx, (W - plateW) / 2, 240, plateW, 150, 24);
  ctx.fill();
  ctx.fillStyle = '#F7C948';
  ctx.textAlign = 'center';
  const platePx = fitText(ctx, route.number, plateW - 60, 96);
  ctx.font = `800 ${platePx}px system-ui, sans-serif`;
  ctx.fillText(route.number, W / 2, 240 + 75 + platePx / 3);

  // terminals
  const first = stagesById[route.stages[0]].name;
  const last = stagesById[route.stages[route.stages.length - 1]].name;
  ctx.fillStyle = '#191c1a';
  const termText = `${first}  ↔  ${last}`;
  const termPx = fitText(ctx, termText, W - 120, 52);
  ctx.font = `800 ${termPx}px system-ui, sans-serif`;
  ctx.fillText(termText, W / 2, 480);
  ctx.fillStyle = '#5c6660';
  ctx.font = '400 32px system-ui, sans-serif';
  ctx.fillText(`${route.stages.length} stages · mat every ${route.headwayMin[0]}–${route.headwayMin[1]} min`, W / 2, 535);

  // shape panel
  ctx.fillStyle = '#dfe7e2';
  roundRect(ctx, 60, 580, W - 120, 420, 28);
  ctx.fill();
  const coords =
    shape && shape.length >= 2
      ? shape
      : route.stages.map((id) => [stagesById[id].lng, stagesById[id].lat] as [number, number]);
  drawShape(ctx, coords, { x: 60, y: 580, w: W - 120, h: 420 });

  // fares
  const fareRows: Array<[string, string]> = [
    ['Off-peak', `KES ${route.fare.offPeak[0]}–${route.fare.offPeak[1]}`],
    ['Peak', `KES ${route.fare.peak[0]}–${route.fare.peak[1]}`],
    ['Rain / late', `up to KES ${route.fare.rainMax}`],
  ];
  const pillW = (W - 120 - 40) / 3;
  fareRows.forEach(([label, value], i) => {
    const x = 60 + i * (pillW + 20);
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x, 1050, pillW, 130, 20);
    ctx.fill();
    ctx.fillStyle = '#5c6660';
    ctx.font = '700 28px system-ui, sans-serif';
    ctx.fillText(label.toUpperCase(), x + pillW / 2, 1098);
    ctx.fillStyle = '#03502b';
    const vPx = fitText(ctx, value, pillW - 30, 34, 800);
    ctx.font = `800 ${vPx}px system-ui, sans-serif`;
    ctx.fillText(value, x + pillW / 2, 1150);
  });

  // footer
  ctx.fillStyle = '#5c6660';
  ctx.font = '400 28px system-ui, sans-serif';
  ctx.fillText(`Routes, fares & offline maps → ${APP_URL}`, W / 2, 1250);
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillText(route.fareVerified ? 'Fares: field-checked sample ranges' : 'Fares: typical range, to be verified', W / 2, 1295);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export async function shareRouteCard(route: MatatuRoute, shape?: [number, number][]): Promise<'shared' | 'downloaded'> {
  const blob = await renderRouteCard(route, shape);
  const file = new File([blob], `njia-route-${route.number}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Route ${route.number}` });
      return 'shared';
    } catch {
      /* user cancelled or share failed — fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'downloaded';
}
