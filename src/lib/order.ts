import type { DemoState, Ticket } from '../state/types';
import { rowLabel, ticketPrice } from './format';

export const COUPON_CODE = 'RAVE10';
export const COUPON_AMOUNT = 10;

export interface SummaryLine {
  id: string;
  label: string;
  qty: number;
  unit: number;
  total: number;
}

export function orderSummary(state: DemoState) {
  const lines: SummaryLine[] = [];
  for (const ticket of state.tickets) {
    const qty = state.order.lines[ticket.id] ?? 0;
    if (qty > 0) lines.push({ id: ticket.id, label: ticket.name, qty, unit: ticketPrice(ticket), total: qty * ticketPrice(ticket) });
  }
  for (const uniform of state.uniforms) {
    const qty = state.order.uniforms[uniform.id] ?? 0;
    if (qty > 0) lines.push({ id: uniform.id, label: uniform.name, qty, unit: uniform.price, total: qty * uniform.price });
  }
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const discount = state.order.coupon ? Math.min(COUPON_AMOUNT, subtotal) : 0;
  const ticketCount = state.tickets.reduce((sum, ticket) => sum + (state.order.lines[ticket.id] ?? 0), 0);
  return { lines, subtotal, discount, total: subtotal - discount, ticketCount };
}

export function seatedTicket(state: DemoState): Ticket | undefined {
  return state.tickets.find((ticket) => ticket.seated && ticket.rows > 0 && ticket.seatsPerRow > 0);
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'open' | 'sold' | 'blocked';
}

/** Deterministic layout so the same seats show as sold on every visit. */
export function seatMap(ticket: Ticket, bookedSeats: string[] = []): Seat[][] {
  const rows: Seat[][] = [];
  const total = ticket.rows * ticket.seatsPerRow;
  const booked = new Set(bookedSeats);
  const soldTarget = Math.max(0, Math.min(ticket.sold - booked.size, total));
  const order = Array.from({ length: total }, (_, index) => index).sort(
    (a, b) => ((a * 7919) % 97) - ((b * 7919) % 97),
  );
  const sold = new Set(order.slice(0, soldTarget));
  for (let r = 0; r < ticket.rows; r += 1) {
    const row: Seat[] = [];
    for (let s = 0; s < ticket.seatsPerRow; s += 1) {
      const index = r * ticket.seatsPerRow + s;
      const label = rowLabel(r);
      const blocked = r === 0 && (s === 0 || s === ticket.seatsPerRow - 1);
      row.push({
        id: `${label}${s + 1}`,
        row: label,
        number: s + 1,
        status: blocked ? 'blocked' : sold.has(index) || booked.has(`${label}${s + 1}`) ? 'sold' : 'open',
      });
    }
    rows.push(row);
  }
  return rows;
}

export function orderRef(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'SR-';
  for (let i = 0; i < 8; i += 1) ref += alphabet[Math.floor(Math.random() * alphabet.length)];
  return ref;
}
