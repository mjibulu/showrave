import type { DemoState } from './types';

export const CATEGORIES = [
  'Music', 'Concert', 'Carnival', 'Entertainment', 'Comedy', 'Arts', 'Food', 'Social', 'Hangouts',
  'Business', 'Technology', 'Seminar', 'Bootcamp', 'Corporate', 'Education', 'Sports',
  'Tournaments', 'Competition', 'Community', 'Retreats', 'Religion', 'Birthday', 'Wedding',
];

function isoDateInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function createSeed(): DemoState {
  return {
    event: {
      name: 'After Hours London',
      organiser: 'Studio Collective',
      category: 'Music',
      description:
        'A late night of house and afrobeats across two rooms, with resident DJs, a rooftop terrace and food from local street kitchens. Doors open at 9pm; last entry 11:30pm.',
      mode: 'venue',
      date: isoDateInDays(24),
      time: '21:00',
      durationHours: 6,
      venue: 'The Steel Yard',
      address: '15 Allhallows Lane',
      city: 'London',
      country: 'GB',
      cover: 'neon',
      isPrivate: false,
      published: false,
    },
    tickets: [
      {
        id: 't-early',
        name: 'Early Bird',
        description: 'Limited first release.',
        price: 12,
        quantity: 150,
        limit: 4,
        sold: 150,
        charges: 'exclude',
        transfer: true,
        seated: false,
        rows: 0,
        seatsPerRow: 0,
      },
      {
        id: 't-general',
        name: 'General Admission',
        description: 'Entry to both rooms and the terrace.',
        price: 20,
        quantity: 400,
        limit: 6,
        sold: 278,
        charges: 'exclude',
        transfer: true,
        seated: false,
        rows: 0,
        seatsPerRow: 0,
      },
      {
        id: 't-mezz',
        name: 'Mezzanine Seat',
        description: 'Reserved seat overlooking the main room, with table service.',
        price: 45,
        quantity: 48,
        limit: 4,
        sold: 17,
        charges: 'include',
        transfer: true,
        seated: true,
        rows: 6,
        seatsPerRow: 8,
      },
    ],
    uniforms: [
      { id: 'u-tee', name: 'After Hours Tee', price: 18, quantity: 120, sold: 41 },
      { id: 'u-tote', name: 'Tote Bag', price: 8, quantity: 80, sold: 22 },
    ],
    order: {
      lines: {},
      uniforms: {},
      seats: [],
      bookedSeats: [],
      coupon: null,
      attendee: 'Major King',
      paid: false,
      ref: '',
      transferredTo: null,
    },
    chat: [
      {
        id: 'm-seed-1',
        from: 'attendee',
        text: 'Hi! Is there a cloakroom at the venue?',
        at: Date.now() - 1000 * 60 * 14,
        read: true,
      },
      {
        id: 'm-seed-2',
        from: 'organiser',
        text: 'Hi Major, yes. Cloakroom is by the main entrance and costs £2 per item.',
        at: Date.now() - 1000 * 60 * 12,
        read: true,
      },
    ],
    dp: {
      template: 'royal',
      name: 'Major King',
      message: "I'll be there",
      photo: null,
      zoom: 100,
      offsetX: 0,
      offsetY: 0,
    },
  };
}
