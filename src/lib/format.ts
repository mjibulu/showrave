import type { EventDraft, Ticket } from '../state/types';

export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

export const COUNTRIES: Country[] = [
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$' },
];

const FALLBACK: Country = { code: 'US', name: 'United States', currency: 'USD', symbol: '$' };

export function countryFor(code: string): Country {
  return COUNTRIES.find((country) => country.code === code) ?? FALLBACK;
}

export function money(amount: number, countryCode: string, decimals = 2): string {
  const { symbol } = countryFor(countryCode);
  const fixed = amount.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${symbol}${fixed}`;
}

/** Mirrors calculateCharges() in the ShowRave create-event form: 4% platform fee, plus 50 above 1000. */
export function charges(price: number, include: boolean) {
  const platformFee = price * 0.04;
  const processingFee = price > 1000 ? 50 : 0;
  const total = platformFee + processingFee;
  return include
    ? { attendeePays: price + total, organiserGets: price, fee: total }
    : { attendeePays: price, organiserGets: Math.max(0, price - total), fee: total };
}

export function ticketPrice(ticket: Ticket): number {
  return charges(ticket.price, ticket.charges === 'include').attendeePays;
}

export function eventStart(event: EventDraft): Date {
  return new Date(`${event.date}T${event.time || '00:00'}`);
}

export function longDate(event: EventDraft): string {
  const start = eventStart(event);
  if (Number.isNaN(start.getTime())) return 'Date to be announced';
  return start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortTime(event: EventDraft): string {
  const start = eventStart(event);
  if (Number.isNaN(start.getTime())) return '';
  return start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function dayMonth(event: EventDraft): { day: string; month: string } {
  const start = eventStart(event);
  if (Number.isNaN(start.getTime())) return { day: '--', month: 'TBA' };
  return {
    day: String(start.getDate()).padStart(2, '0'),
    month: start.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

export function locationLine(event: EventDraft): string {
  if (event.mode === 'online') return 'Online event';
  return [event.venue, event.city].filter(Boolean).join(', ') || 'Venue to be announced';
}

export function rowLabel(index: number): string {
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
