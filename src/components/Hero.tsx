import { useDemo } from '../state/DemoProvider';
import { dayMonth, locationLine, money, ticketPrice } from '../lib/format';
import { Cover } from './Frames';
import { Icon } from './Icon';

export function Hero() {
  const { state } = useDemo();
  const { event, tickets } = state;
  const { day, month } = dayMonth(event);

  const onSale = tickets.filter((ticket) => ticket.quantity > ticket.sold);
  const priced = onSale.length ? onSale : tickets;
  const from = priced.length ? Math.min(...priced.map(ticketPrice)) : 0;

  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />

      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow eyebrow--light">Event ticketing</p>

          <h1>
            Create it. Sell it.
            <br />
            <span>Run the door.</span>
          </h1>

          <p className="hero-lead">
            Sell tickets, manage events and check in attendees with ShowRave.
          </p>

          <div className="hero-actions">
            <a className="btn btn--primary btn--lg" href="#demo">
              Try the demo <Icon name="arrowRight" />
            </a>

            <a
              className="btn btn--outline-light btn--lg"
              href="https://showrave.com"
              target="_blank"
              rel="noreferrer"
            >
              Visit ShowRave
            </a>
          </div>

          <dl className="hero-stats">
            <div>
              <dt>30</dt>
              <dd>languages</dd>
            </div>
            <div>
              <dt>50+</dt>
              <dd>countries</dd>
            </div>
            <div>
              <dt>Offline</dt>
              <dd>ticket scanning</dd>
            </div>
          </dl>
        </div>

        <div className="hero-stage" aria-hidden="true">
          <div className="hero-card hero-card--event">
            <Cover cover={event.cover}>
              <span className="date-chip">
                <b>{day}</b>
                {month}
              </span>
            </Cover>

            <div className="hero-card-body">
              <small>{event.category}</small>
              <strong>{event.name || 'Your event'}</strong>

              <span>
                <Icon name="pin" size={14} /> {locationLine(event)}
              </span>

              <div className="hero-card-foot">
                <span>
                  From {from === 0 ? 'Free' : money(from, event.country)}
                </span>
                <b>Book now</b>
              </div>
            </div>
          </div>

          <div className="hero-float hero-float--chat">
            <span className="avatar avatar--sm avatar--rose">MK</span>
            <div>
              <small>Major King · now</small>
              <p>Is there a cloakroom at the venue?</p>
            </div>
          </div>

          <div className="hero-float hero-float--scan">
            <span className="scan-badge">
              <Icon name="check" size={20} strokeWidth={3} />
            </span>
            <div>
              <small>Ticket Scanner</small>
              <strong>Valid · Admitted</strong>
            </div>
          </div>

          <div className="hero-float hero-float--sales">
            <small>Tickets sold today</small>
            <strong>+128</strong>
            <svg viewBox="0 0 120 36">
              <path d="M0 30 L15 26 L30 28 L45 18 L60 21 L75 12 L90 14 L105 6 L120 4" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}