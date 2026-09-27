import type { EventDraft } from '../state/types';
import { eventStart, locationLine } from './format';

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function icsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function downloadIcs(event: EventDraft): void {
  const start = eventStart(event);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + Math.max(1, event.durationHours) * 3600 * 1000);
  const location = event.mode === 'online' ? 'Online' : [event.venue, event.address, event.city].filter(Boolean).join(', ');
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShowRave//Demo//EN',
    'BEGIN:VEVENT',
    `UID:${slugify(event.name)}-${icsStamp(start)}@showrave.com`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(event.name)}`,
    `DESCRIPTION:${icsEscape(event.description)}`,
    `LOCATION:${icsEscape(location || locationLine(event))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  downloadBlob(new Blob([body], { type: 'text/calendar' }), `${slugify(event.name)}.ics`);
}
