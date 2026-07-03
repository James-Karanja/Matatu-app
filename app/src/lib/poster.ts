/* Renders a printable stage poster (A4 portrait) with a QR code to the
   app — the physical acquisition channel: posters at the top termini
   catch commuters at the exact moment of need. */

import QRCode from 'qrcode';
import { routeNumbersByStage, type Stage } from '../data/network';
import { APP_URL } from './routeCard';

const W = 1240;
const H = 1754;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderPoster(stage: Stage): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // header
  const grad = ctx.createLinearGradient(0, 0, W, 260);
  grad.addColorStop(0, '#046A38');
  grad.addColorStop(1, '#03502b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 260);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '800 96px system-ui, sans-serif';
  ctx.fillText('Njia', W / 2, 130);
  ctx.font = '400 44px system-ui, sans-serif';
  ctx.globalAlpha = 0.9;
  ctx.fillText('Njia zote za mat · bei zote · kwa simu yako', W / 2, 205);
  ctx.globalAlpha = 1;

  // stage name
  ctx.fillStyle = '#191c1a';
  let px = 84;
  do {
    ctx.font = `800 ${px}px system-ui, sans-serif`;
    if (ctx.measureText(stage.name).width <= W - 160) break;
    px -= 4;
  } while (px > 40);
  ctx.fillText(stage.name, W / 2, 400);

  // routes serving this stage
  const numbers = routeNumbersByStage[stage.id] ?? [];
  if (numbers.length > 0) {
    ctx.fillStyle = '#5c6660';
    ctx.font = '700 40px system-ui, sans-serif';
    ctx.fillText('MATATU ROUTES HERE', W / 2, 490);
    const shown = numbers.slice(0, 8);
    const plateW = 130;
    const gap = 24;
    const rowW = shown.length * plateW + (shown.length - 1) * gap;
    shown.forEach((n, i) => {
      const x = (W - rowW) / 2 + i * (plateW + gap);
      ctx.fillStyle = '#131313';
      roundRect(ctx, x, 530, plateW, 90, 16);
      ctx.fill();
      ctx.fillStyle = '#F7C948';
      let nPx = 44;
      do {
        ctx.font = `800 ${nPx}px system-ui, sans-serif`;
        if (ctx.measureText(n).width <= plateW - 24) break;
        nPx -= 2;
      } while (nPx > 20);
      ctx.fillText(n, x + plateW / 2, 530 + 45 + nPx / 3);
    });
    if (numbers.length > 8) {
      ctx.fillStyle = '#5c6660';
      ctx.font = '400 34px system-ui, sans-serif';
      ctx.fillText(`…and ${numbers.length - 8} more in the app`, W / 2, 690);
    }
  }

  // QR code
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, `https://${APP_URL}/`, {
    width: 620,
    margin: 2,
    color: { dark: '#131313', light: '#ffffff' },
  });
  ctx.strokeStyle = '#046A38';
  ctx.lineWidth = 10;
  roundRect(ctx, (W - 660) / 2, 750, 660, 660, 28);
  ctx.stroke();
  ctx.drawImage(qrCanvas, (W - 620) / 2, 770);

  ctx.fillStyle = '#191c1a';
  ctx.font = '800 52px system-ui, sans-serif';
  ctx.fillText('SCAN FOR ROUTES & FARES', W / 2, 1510);
  ctx.fillStyle = '#5c6660';
  ctx.font = '400 38px system-ui, sans-serif';
  ctx.fillText('Free · works offline · hakuna kujisajili', W / 2, 1575);
  ctx.font = '400 34px system-ui, sans-serif';
  ctx.fillText(APP_URL, W / 2, 1660);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
