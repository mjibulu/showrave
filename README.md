# ShowRave

ShowRave is an event platform built to help organisers post events online, sell tickets online, reach more people, and manage the full event journey from launch to check-in.

Whether you are promoting a concert, party, community gathering, business event, festival, workshop, or online experience, ShowRave is designed to make event creation and ticket selling feel easier, faster, and more professional.

## Create and Post Events Online

ShowRave helps organisers:

- Post events online with a cleaner event-publishing flow
- Launch event pages that are easier to browse and book from
- Present event details in a way that helps more people convert
- Manage event visibility, attendee flow, and event-day readiness
- Support check-in with companion scanner tooling

## Sell Tickets Online with ShowRave

If you are looking for a way to create an event page, promote an event, and sell tickets online, ShowRave is built around those exact needs.

The product experience shown in this repository focuses on:

- Event discovery and homepage promotion
- Event details pages designed to support ticket sales
- Attendee-side flows for saved events, bookings, and notifications
- Organiser-side flows for managing live events, bookings, and reporting views

## Event Management Platform for Organisers

ShowRave supports organisers who want to:

- Create event pages that are easier to browse and book from
- Launch music events, nightlife events, business events, and community events
- Give attendees a smoother booking experience on mobile and web
- Keep event operations more organised from promotion to entry
- Use a dedicated scanner experience to support check-in at the venue

## Event Ticketing and Event Promotion

ShowRave brings together key parts of the organiser journey in one product experience:

- Event promotion and discovery
- Event details and ticket selection
- Attendee bookings and saved events
- Organiser-side management and reporting
- Event-day check-in support

## Available on Mobile

- Main app on Google Play: https://play.google.com/store/apps/details?id=com.showrave.mainapp
- Main app on the App Store: https://apps.apple.com/us/app/showrave-events-tickets/id6758464948
- Scanner app on Google Play: https://play.google.com/store/apps/details?id=com.showrave.ticketscanner
- Scanner app on the App Store: https://apps.apple.com/us/app/ticket-scanner-showrave/id6758725925

## What You Can Explore Here

- A homepage shaped around event discovery and event promotion
- A mock event details page focused on helping organisers present events clearly
- An attendee-side experience with booked tickets, saved events, and notifications
- An organiser-side experience with live events, bookings, payouts, and reporting views
- A product direction that stays close to the main app while using safe mock data

## Run Locally

```powershell
php -S 127.0.0.1:8088 -t .
```

Then open:

```text
http://127.0.0.1:8088
```

You can also open the other mock product views directly:

- `http://127.0.0.1:8088/attendee.html`
- `http://127.0.0.1:8088/organiser.html`
- `http://127.0.0.1:8088/event.html`

## Notes

- The pages in this folder use mock data and safe public assets.
- The goal is to present the ShowRave product experience without exposing private backend systems or production-only logic.