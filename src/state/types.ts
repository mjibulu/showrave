export type CoverId = 'neon' | 'sunset' | 'ocean' | 'gold';
export type TemplateId = 'royal' | 'festival' | 'night' | 'polaroid';

export interface Ticket {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  limit: number;
  sold: number;
  charges: 'exclude' | 'include';
  transfer: boolean;
  seated: boolean;
  rows: number;
  seatsPerRow: number;
}

export interface Uniform {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

export interface EventDraft {
  name: string;
  organiser: string;
  category: string;
  description: string;
  mode: 'venue' | 'online';
  date: string;
  time: string;
  durationHours: number;
  venue: string;
  address: string;
  city: string;
  country: string;
  cover: CoverId;
  isPrivate: boolean;
  published: boolean;
}

export interface Order {
  lines: Record<string, number>;
  uniforms: Record<string, number>;
  seats: string[];
  bookedSeats: string[];
  coupon: string | null;
  attendee: string;
  paid: boolean;
  ref: string;
  transferredTo: string | null;
}

export interface ChatMessage {
  id: string;
  from: 'attendee' | 'organiser';
  text: string;
  image?: string;
  at: number;
  read: boolean;
}

export interface DpState {
  template: TemplateId;
  name: string;
  message: string;
  photo: string | null;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface DemoState {
  event: EventDraft;
  tickets: Ticket[];
  uniforms: Uniform[];
  order: Order;
  chat: ChatMessage[];
  dp: DpState;
}
