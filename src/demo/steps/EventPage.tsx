import { useEffect, useState } from 'react';
import { useDemo } from '../../state/DemoProvider';
import { countryFor, eventStart, locationLine, longDate, money, shortTime, ticketPrice } from '../../lib/format';
import { orderSummary } from '../../lib/order';
import { downloadIcs, slugify } from '../../lib/download';
import { BrowserFrame, Cover } from '../../components/Frames';
import { QtyStepper } from '../../components/ui';
import { Icon } from '../../components/Icon';

const LANGS = {
  en: { name: 'English', book: 'Book now', share: 'Share', about: 'About', when: 'Date and time', where: 'Location', tickets: 'Tickets', extras: 'Extras', posted: 'Organiser', contact: 'Message', calendar: 'Add to calendar', dp: 'Create a DP', total: 'Total', soldOut: 'Sold out', waitlist: 'Join waitlist', onList: 'On the waitlist', map: 'View map', starts: 'Starts in', online: 'Online event', left: 'left' },
  fr: { name: 'Français', book: 'Réserver', share: 'Partager', about: 'À propos', when: 'Date et heure', where: 'Lieu', tickets: 'Billets', extras: 'Extras', posted: 'Organisateur', contact: 'Message', calendar: 'Ajouter au calendrier', dp: 'Créer une photo', total: 'Total', soldOut: 'Complet', waitlist: "Liste d'attente", onList: "Sur la liste d'attente", map: 'Voir la carte', starts: 'Commence dans', online: 'Événement en ligne', left: 'restants' },
  de: { name: 'Deutsch', book: 'Jetzt buchen', share: 'Teilen', about: 'Info', when: 'Datum und Uhrzeit', where: 'Ort', tickets: 'Tickets', extras: 'Extras', posted: 'Veranstalter', contact: 'Nachricht', calendar: 'Zum Kalender hinzufügen', dp: 'Profilbild erstellen', total: 'Gesamt', soldOut: 'Ausverkauft', waitlist: 'Auf die Warteliste', onList: 'Auf der Warteliste', map: 'Karte ansehen', starts: 'Beginnt in', online: 'Online-Veranstaltung', left: 'übrig' },
  es: { name: 'Español', book: 'Reservar', share: 'Compartir', about: 'Información', when: 'Fecha y hora', where: 'Ubicación', tickets: 'Entradas', extras: 'Extras', posted: 'Organizador', contact: 'Mensaje', calendar: 'Añadir al calendario', dp: 'Crear foto', total: 'Total', soldOut: 'Agotado', waitlist: 'Lista de espera', onList: 'En la lista de espera', map: 'Ver mapa', starts: 'Empieza en', online: 'Evento en línea', left: 'quedan' },
  nl: { name: 'Nederlands', book: 'Nu boeken', share: 'Delen', about: 'Info', when: 'Datum en tijd', where: 'Locatie', tickets: 'Tickets', extras: "Extra's", posted: 'Organisator', contact: 'Bericht', calendar: 'Aan agenda toevoegen', dp: 'Foto maken', total: 'Totaal', soldOut: 'Uitverkocht', waitlist: 'Wachtlijst', onList: 'Op de wachtlijst', map: 'Kaart bekijken', starts: 'Begint over', online: 'Online evenement', left: 'over' },
};
type Lang = keyof typeof LANGS;

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
  };
}

export function EventPage() {
  const { state, setOrder, goTo } = useDemo();
  const { event, tickets, uniforms, order } = state;
  const [lang, setLang] = useState<Lang>('en');
  const [saved, setSaved] = useState(false);
  const [waitlisted, setWaitlisted] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const t = LANGS[lang];
  const summary = orderSummary(state);
  const countdown = useCountdown(eventStart(event));
  const country = countryFor(event.country);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const share = async () => {
    const url = `https://showrave.com/event/${slugify(event.name)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast('Link copied');
    } catch {
      // Share sheet dismissed or clipboard blocked; nothing to report.
    }
  };

  const book = () => {
    if (summary.ticketCount === 0) {
      setToast('Choose a ticket');
      document.getElementById('ev-tickets')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    goTo('checkout');
  };

  return (
    <BrowserFrame url={`showrave.com/event/${slugify(event.name)}`}>
      <div className="evpage">
        <div className="evpage-toolbar">
          <label className="lang-select">
            <Icon name="globe" size={16} />
            <span className="sr-only">Language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              {Object.entries(LANGS).map(([code, value]) => <option key={code} value={code}>{value.name}</option>)}
            </select>
          </label>
        </div>

        <Cover cover={event.cover} className="evpage-hero" />

        <div className="evpage-grid">
          <div className="evpage-main">
            <div className="evpage-intro">
              <span className="chip">{event.category}</span>
              <h3>
                {event.name}
                <Icon name="verified" size={22} className="verified" />
              </h3>
              <div className="meta-row">
                <span><Icon name="calendar" size={16} /> {longDate(event)}</span>
                <span><Icon name="clock" size={16} /> {shortTime(event)}</span>
                <span><Icon name="pin" size={16} /> {event.mode === 'online' ? t.online : locationLine(event)}</span>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn--primary" onClick={book}>{t.book}</button>
                <button type="button" className="btn btn--ghost" onClick={share}><Icon name="share" size={16} /> {t.share}</button>
                <button type="button" className={`icon-btn icon-btn--lg ${saved ? 'is-on' : ''}`} aria-pressed={saved} aria-label="Save event" onClick={() => setSaved(!saved)}>
                  <Icon name="bookmark" size={18} />
                </button>
              </div>
            </div>

            <div className="countdown" aria-label={t.starts}>
              <span>{t.starts}</span>
              {(['d', 'h', 'm', 's'] as const).map((unit) => (
                <div key={unit}><b>{String(countdown[unit]).padStart(2, '0')}</b><small>{unit}</small></div>
              ))}
            </div>

            <section className="evpage-section">
              <h4>{t.about}</h4>
              <p>{event.description}</p>
            </section>

            <section className="evpage-section details-grid">
              <div>
                <h5>{t.when}</h5>
                <p>{longDate(event)}, {shortTime(event)}</p>
                <button type="button" className="link-btn" onClick={() => downloadIcs(event)}>
                  <Icon name="calendar" size={15} /> {t.calendar}
                </button>
              </div>
              <div>
                <h5>{t.where}</h5>
                <p>{event.mode === 'online' ? t.online : [event.venue, event.address, event.city].filter(Boolean).join(', ')}</p>
              </div>
            </section>

            {event.mode === 'venue' && (
              <div className="map-preview" aria-hidden="true">
                <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
                  <rect width="600" height="200" className="map-bg" />
                  <path className="map-river" d="M-10 150 C120 110 200 190 330 140 S520 90 610 120" />
                  <g className="map-roads">
                    <path d="M0 60 H600M0 110 H600M120 0 V200M260 0 V200M420 0 V200M520 0 V200M40 0 L300 200" />
                  </g>
                  <circle cx="300" cy="86" r="28" className="map-pulse" />
                </svg>
                <span className="map-pin"><Icon name="pin" size={22} /></span>
                <span className="map-label">{event.venue} · {t.map}</span>
              </div>
            )}
          </div>

          <aside className="evpage-side">
            <section className="booking-box" id="ev-tickets">
              <h4>{t.tickets}</h4>
              {tickets.map((ticket) => {
                const left = ticket.quantity - ticket.sold;
                const soldOut = left <= 0;
                const qty = order.lines[ticket.id] ?? 0;
                return (
                  <div className={`ticket-option ${soldOut ? 'is-sold-out' : ''}`} key={ticket.id}>
                    <div>
                      <strong>{ticket.name || 'Ticket'}</strong>
                      <span className="ticket-price">{ticket.price === 0 ? 'Free' : money(ticketPrice(ticket), event.country)}</span>
                      <small>{soldOut ? t.soldOut : ticket.seated ? `Reserved seat · ${left} ${t.left}` : `${left} ${t.left}`}</small>
                    </div>
                    {soldOut ? (
                      <button
                        type="button"
                        className={`btn btn--sm ${waitlisted.includes(ticket.id) ? 'btn--ghost' : 'btn--outline'}`}
                        onClick={() => {
                          if (waitlisted.includes(ticket.id)) return;
                          setWaitlisted([...waitlisted, ticket.id]);
                          setToast("We'll email you if tickets are released");
                        }}
                      >
                        {waitlisted.includes(ticket.id) ? <><Icon name="check" size={14} /> {t.onList}</> : t.waitlist}
                      </button>
                    ) : (
                      <QtyStepper
                        label={ticket.name}
                        value={qty}
                        max={Math.min(ticket.limit, left)}
                        onChange={(value) => setOrder({ lines: { ...order.lines, [ticket.id]: value }, seats: ticket.seated ? order.seats.slice(0, value) : order.seats })}
                      />
                    )}
                  </div>
                );
              })}

              {uniforms.length > 0 && (
                <>
                  <h4>{t.extras}</h4>
                  {uniforms.map((uniform) => (
                    <div className="ticket-option" key={uniform.id}>
                      <div>
                        <strong>{uniform.name || 'Item'}</strong>
                        <span className="ticket-price">{money(uniform.price, event.country)}</span>
                      </div>
                      <QtyStepper
                        label={uniform.name}
                        value={order.uniforms[uniform.id] ?? 0}
                        max={Math.max(0, Math.min(10, uniform.quantity - uniform.sold))}
                        onChange={(value) => setOrder({ uniforms: { ...order.uniforms, [uniform.id]: value } })}
                      />
                    </div>
                  ))}
                </>
              )}

              <div className="booking-total">
                <span>{t.total}</span>
                <strong>{money(summary.subtotal, event.country)} <small>({country.currency})</small></strong>
              </div>
              <button type="button" className="btn btn--primary btn--block" onClick={book}>{t.book}</button>
            </section>

            <section className="posted-by">
              <h5>{t.posted}</h5>
              <div className="organiser-row">
                <span className="avatar avatar--wine">{event.organiser.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{event.organiser}</strong>
                  <small><Icon name="verified" size={13} /> Verified organiser</small>
                </div>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => goTo('chat')}><Icon name="chat" size={15} /> {t.contact}</button>
                <button type="button" className="btn btn--gold btn--sm" onClick={() => goTo('dp')}><Icon name="image" size={15} /> {t.dp}</button>
              </div>
            </section>
          </aside>
        </div>

        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    </BrowserFrame>
  );
}
