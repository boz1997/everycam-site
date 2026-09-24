// ".ics" calendar reminder for the deletion date (plan D19). Web-only hosts get no
// push (expiryHost) and Sharecam sends no email (AGENTS.md), so the promise
// "nothing is deleted silently" is kept by the date on every event, the banners
// at 14 / 5 / 2 days, and this file: one all-day entry three days before the
// date, with two alarms (14 days before the deletion, and that morning).

const pad = (n: number) => String(n).padStart(2, '0');
const dayStamp = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};
const utcStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
/** RFC 5545 TEXT escaping + 75-octet folding (approximated by characters). */
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join('\r\n');
}

export interface IcsInput {
  eventId: string;
  deletionAt: number;
  title: string;
  description: string;
  url: string;
  now?: number;
}

export function expiryIcs({ eventId, deletionAt, title, description, url, now = Date.now() }: IcsInput): string {
  const reminderDay = deletionAt - 3 * 86_400_000;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sharecam//Host dashboard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${eventId}-deletion@sharecam.app`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART;VALUE=DATE:${dayStamp(reminderDay)}`,
    `DTEND;VALUE=DATE:${dayStamp(reminderDay + 86_400_000)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(`${description}\n${url}`)}`,
    `URL:${url}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'TRIGGER:-P11D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
