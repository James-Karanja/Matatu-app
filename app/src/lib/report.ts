/* Composes structured crowdsource reports (fare paid, corrections).
   No backend yet, so reports are handed off through channels the user
   already has: a prefilled GitHub issue, the system share sheet
   (WhatsApp etc.), or the clipboard. Nothing is sent automatically. */

import { DATA_VERSION, type MatatuRoute } from '../data/network';

export const REPO_URL = 'https://github.com/James-Karanja/Matatu-app';

export type ReportKind = 'fare' | 'edit';
export type FareCondition = 'off-peak' | 'peak' | 'rain' | 'night';

export interface ReportInput {
  kind: ReportKind;
  farePaid?: number;
  condition?: FareCondition;
  note?: string;
}

export interface Report {
  title: string;
  body: string;
  issueUrl: string;
}

export function composeReport(route: MatatuRoute, input: ReportInput): Report {
  const title =
    input.kind === 'fare'
      ? `Fare report: route ${route.number}${input.farePaid ? ` — KES ${input.farePaid}` : ''}`
      : `Data correction: route ${route.number}`;

  const lines = [
    `Route: ${route.number} — ${route.nickname}`,
    `Route id: ${route.id}`,
    `Report type: ${input.kind === 'fare' ? 'fare paid' : 'route/stage correction'}`,
  ];
  if (input.kind === 'fare') {
    if (input.farePaid) lines.push(`Fare paid: KES ${input.farePaid}`);
    if (input.condition) lines.push(`Condition: ${input.condition}`);
  }
  if (input.note?.trim()) lines.push(`Note: ${input.note.trim()}`);
  lines.push(`Data version: ${DATA_VERSION}`, `Reported: ${new Date().toISOString().slice(0, 10)}`);

  const body = lines.join('\n');
  const issueUrl = `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  return { title, body, issueUrl };
}
