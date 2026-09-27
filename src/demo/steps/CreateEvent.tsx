import { useEffect, useRef, useState } from 'react';
import { useDemo } from '../../state/DemoProvider';
import { CATEGORIES } from '../../state/seed';
import type { Ticket, Uniform } from '../../state/types';
import { COUNTRIES, charges, countryFor, dayMonth, locationLine, longDate, money, shortTime, uid } from '../../lib/format';
import { BrowserFrame, COVERS, Cover } from '../../components/Frames';
import { Field, Segmented, Switch, toNumber } from '../../components/ui';
import { Icon } from '../../components/Icon';

const WIZARD = ['Details', 'Tickets', 'Review'];

function draftDescription(name: string, category: string, city: string, online: boolean): string {
  const where = online ? 'online, wherever you are' : `in ${city || 'the city'}`;
  const title = name || 'This event';
  const lead: Record<string, string> = {
    Music: `${title} brings a night of live sets and big sound ${where}.`,
    Concert: `${title} is a live concert ${where}, with a full band and special guests.`,
    Business: `${title} gathers founders, operators and investors ${where} for talks and focused networking.`,
    Technology: `${title} is a day of practical talks and demos ${where} for people who build software.`,
    Comedy: `${title} is an evening of stand-up ${where}, with a headline set and three rising acts.`,
    Food: `${title} is a tasting event ${where}, featuring local kitchens, producers and live cooking.`,
  };
  return lead[category] ?? `${title} is a ${category.toLowerCase()} event ${where}.`;
}

function newTicket(): Ticket {
  return {
    id: uid('t'), name: '', description: '', price: 0, quantity: 100, limit: 4, sold: 0,
    charges: 'exclude', transfer: true, seated: false, rows: 5, seatsPerRow: 10,
  };
}

export function CreateEvent() {
  const { state, setEvent, setTickets, setUniforms, goTo } = useDemo();
  const { event, tickets, uniforms } = state;
  const [stage, setStage] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const writer = useRef<number | null>(null);
  const country = countryFor(event.country);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const timer = window.setTimeout(() => setSavedAt(Date.now()), 600);
    return () => window.clearTimeout(timer);
  }, [event, tickets, uniforms]);

  useEffect(() => () => { if (writer.current) window.clearInterval(writer.current); }, []);

  const generate = () => {
    if (writer.current) window.clearInterval(writer.current);
    const text = draftDescription(event.name, event.category, event.city, event.mode === 'online');
    const words = text.split(' ');
    let count = 0;
    setWriting(true);
    writer.current = window.setInterval(() => {
      count += 2;
      setEvent({ description: words.slice(0, count).join(' ') });
      if (count >= words.length) {
        if (writer.current) window.clearInterval(writer.current);
        setWriting(false);
      }
    }, 45);
  };

  const updateTicket = (id: string, patch: Partial<Ticket>) =>
    setTickets(tickets.map((ticket) => (ticket.id === id ? { ...ticket, ...patch } : ticket)));
  const updateUniform = (id: string, patch: Partial<Uniform>) =>
    setUniforms(uniforms.map((uniform) => (uniform.id === id ? { ...uniform, ...patch } : uniform)));

  const detailsValid = event.name.trim() && event.date && event.time && (event.mode === 'online' || event.venue.trim());
  const ticketsValid = tickets.length > 0 && tickets.every((ticket) => ticket.name.trim() && ticket.quantity > 0);
  const canContinue = stage === 0 ? detailsValid : stage === 1 ? ticketsValid : true;
  const { day, month } = dayMonth(event);
  const lowest = tickets.length ? Math.min(...tickets.map((ticket) => charges(ticket.price, ticket.charges === 'include').attendeePays)) : 0;

  return (
    <BrowserFrame url={`showrave.com/create/create-${event.mode === 'online' ? 'online' : 'venue'}-event`}>
      <div className="create">
        <div className="create-top">
          <ol className="wizard">
            {WIZARD.map((label, i) => (
              <li key={label} className={i === stage ? 'is-current' : i < stage ? 'is-done' : ''}>
                <button type="button" onClick={() => (i <= stage || (i === 1 && detailsValid) || (i === 2 && detailsValid && ticketsValid)) && setStage(i)}>
                  <span>{i < stage ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
          <span className={`draft-state ${savedAt ? 'is-visible' : ''}`} key={savedAt ?? 0}>
            <Icon name="check" size={14} /> Draft saved
          </span>
        </div>

        <div className="create-grid">
          <div className="create-form">
            {event.published && stage === 2 ? (
              <div className="publish-success">
                <span className="success-mark"><Icon name="check" size={30} strokeWidth={2.6} /></span>
                <h3>Event published</h3>
                {event.isPrivate && <p>Only people with the link can book.</p>}
                <div className="row-actions">
                  <button type="button" className="btn btn--primary" onClick={() => goTo('page')}>
                    View event <Icon name="arrowRight" size={16} />
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => { setEvent({ published: false }); setStage(0); }}>
                    Edit event
                  </button>
                </div>
              </div>
            ) : stage === 0 ? (
              <div className="form-stack">
                <Field label="Event name">
                  {(id) => <input id={id} value={event.name} maxLength={70} placeholder="Summer Rooftop Party" onChange={(e) => setEvent({ name: e.target.value })} />}
                </Field>
                <div className="form-row">
                  <Field label="Organiser">
                    {(id) => <input id={id} value={event.organiser} onChange={(e) => setEvent({ organiser: e.target.value })} />}
                  </Field>
                  <Field label="Category">
                    {(id) => (
                      <select id={id} value={event.category} onChange={(e) => setEvent({ category: e.target.value })}>
                        {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    )}
                  </Field>
                </div>
                <Field label="Description">
                  {(id) => (
                    <div className="textarea-wrap">
                      <textarea id={id} rows={4} value={event.description} onChange={(e) => setEvent({ description: e.target.value })} />
                      <button type="button" className="ai-button" onClick={generate} disabled={writing}>
                        <Icon name="sparkle" size={15} /> {event.description ? 'Regenerate' : 'Generate'}
                      </button>
                    </div>
                  )}
                </Field>
                <Segmented
                  label="Event type"
                  value={event.mode}
                  onChange={(mode) => setEvent({ mode })}
                  options={[{ value: 'venue', label: 'Venue' }, { value: 'online', label: 'Online' }]}
                />
                <div className="form-row form-row--3">
                  <Field label="Date">
                    {(id) => <input id={id} type="date" value={event.date} onChange={(e) => setEvent({ date: e.target.value })} />}
                  </Field>
                  <Field label="Start time">
                    {(id) => <input id={id} type="time" value={event.time} onChange={(e) => setEvent({ time: e.target.value })} />}
                  </Field>
                  <Field label="Duration">
                    {(id) => (
                      <select id={id} value={event.durationHours} onChange={(e) => setEvent({ durationHours: Number(e.target.value) })}>
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => <option key={hours} value={hours}>{hours} hours</option>)}
                      </select>
                    )}
                  </Field>
                </div>
                {event.mode === 'venue' && (
                  <>
                    <div className="form-row">
                      <Field label="Venue">
                        {(id) => <input id={id} value={event.venue} onChange={(e) => setEvent({ venue: e.target.value })} />}
                      </Field>
                      <Field label="Address">
                        {(id) => <input id={id} value={event.address} onChange={(e) => setEvent({ address: e.target.value })} />}
                      </Field>
                    </div>
                  </>
                )}
                <div className="form-row">
                  {event.mode === 'venue' && (
                    <Field label="City">
                      {(id) => <input id={id} value={event.city} onChange={(e) => setEvent({ city: e.target.value })} />}
                    </Field>
                  )}
                  <Field label="Country" hint={<>Prices in <b>{country.currency} ({country.symbol})</b></>}>
                    {(id) => (
                      <select id={id} value={event.country} onChange={(e) => setEvent({ country: e.target.value })}>
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    )}
                  </Field>
                </div>
                <div className="field">
                  <span className="field-label">Cover image</span>
                  <div className="cover-picker" role="radiogroup" aria-label="Cover image">
                    {COVERS.map((cover) => (
                      <button key={cover.id} type="button" role="radio" aria-checked={event.cover === cover.id} aria-label={cover.label} onClick={() => setEvent({ cover: cover.id })}>
                        <Cover cover={cover.id} />
                      </button>
                    ))}
                  </div>
                </div>
                <Switch checked={event.isPrivate} onChange={(isPrivate) => setEvent({ isPrivate })} label="Private: only people with the link can book" />
              </div>
            ) : stage === 1 ? (
              <div className="form-stack">
                <h4 className="form-section-title">Tickets</h4>
                {tickets.map((ticket, i) => {
                  const fee = charges(ticket.price, ticket.charges === 'include');
                  return (
                    <div className="ticket-card" key={ticket.id}>
                      <div className="ticket-card-head">
                        <strong>Ticket {i + 1}</strong>
                        {tickets.length > 1 && (
                          <button type="button" className="icon-btn" aria-label={`Remove ${ticket.name || 'ticket'}`} onClick={() => setTickets(tickets.filter((t) => t.id !== ticket.id))}>
                            <Icon name="trash" size={16} />
                          </button>
                        )}
                      </div>
                      <Field label="Name">
                        {(id) => <input id={id} value={ticket.name} placeholder="General Admission" onChange={(e) => updateTicket(ticket.id, { name: e.target.value })} />}
                      </Field>
                      <div className="form-row form-row--3">
                        <Field label={`Price (${country.symbol})`} hint={ticket.price === 0 ? 'Free' : undefined}>
                          {(id) => <input id={id} type="number" min={0} step="0.5" inputMode="decimal" value={ticket.price} onChange={(e) => updateTicket(ticket.id, { price: toNumber(e.target.value) })} />}
                        </Field>
                        <Field label="Quantity">
                          {(id) => <input id={id} type="number" min={1} inputMode="numeric" value={ticket.quantity} onChange={(e) => updateTicket(ticket.id, { quantity: Math.max(ticket.sold, toNumber(e.target.value, 1)) })} />}
                        </Field>
                        <Field label="Limit per person">
                          {(id) => <input id={id} type="number" min={1} max={20} inputMode="numeric" value={ticket.limit} onChange={(e) => updateTicket(ticket.id, { limit: Math.max(1, toNumber(e.target.value, 1)) })} />}
                        </Field>
                      </div>
                      {ticket.price > 0 && (
                        <div className="charge-box">
                          <Segmented
                            label="Charge options"
                            value={ticket.charges}
                            onChange={(value) => updateTicket(ticket.id, { charges: value })}
                            options={[{ value: 'exclude', label: 'Exclude charges' }, { value: 'include', label: 'Include charges' }]}
                          />
                          <p>
                            Attendee pays <b>{money(fee.attendeePays, event.country)}</b>
                            <span> · You receive {money(fee.organiserGets, event.country)}</span>
                          </p>
                        </div>
                      )}
                      <div className="switch-row">
                        <Switch checked={ticket.transfer} onChange={(transfer) => updateTicket(ticket.id, { transfer })} label="Allow transfers" />
                        <Switch checked={ticket.seated} onChange={(seated) => updateTicket(ticket.id, { seated })} label="Reserved seating" />
                      </div>
                      {ticket.seated && (
                        <div className="form-row">
                          <Field label="Rows" hint="A, B, C…">
                            {(id) => <input id={id} type="number" min={1} max={12} inputMode="numeric" value={ticket.rows} onChange={(e) => updateTicket(ticket.id, { rows: Math.min(12, Math.max(1, toNumber(e.target.value, 1))) })} />}
                          </Field>
                          <Field label="Seats per row">
                            {(id) => <input id={id} type="number" min={1} max={14} inputMode="numeric" value={ticket.seatsPerRow} onChange={(e) => updateTicket(ticket.id, { seatsPerRow: Math.min(14, Math.max(1, toNumber(e.target.value, 1))) })} />}
                          </Field>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button type="button" className="btn btn--dashed" onClick={() => setTickets([...tickets, newTicket()])}>
                  <Icon name="plus" size={16} /> Add ticket
                </button>

                <h4 className="form-section-title">Extras</h4>
                {uniforms.map((uniform) => (
                  <div className="uniform-row" key={uniform.id}>
                    <Field label="Name">
                      {(id) => <input id={id} value={uniform.name} placeholder="T-shirt" onChange={(e) => updateUniform(uniform.id, { name: e.target.value })} />}
                    </Field>
                    <Field label={`Price (${country.symbol})`}>
                      {(id) => <input id={id} type="number" min={0} inputMode="decimal" value={uniform.price} onChange={(e) => updateUniform(uniform.id, { price: toNumber(e.target.value) })} />}
                    </Field>
                    <Field label="Quantity">
                      {(id) => <input id={id} type="number" min={1} inputMode="numeric" value={uniform.quantity} onChange={(e) => updateUniform(uniform.id, { quantity: Math.max(uniform.sold, toNumber(e.target.value, 1)) })} />}
                    </Field>
                    <button type="button" className="icon-btn" aria-label={`Remove ${uniform.name || 'extra'}`} onClick={() => setUniforms(uniforms.filter((u) => u.id !== uniform.id))}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn--dashed" onClick={() => setUniforms([...uniforms, { id: uid('u'), name: '', price: 10, quantity: 50, sold: 0 }])}>
                  <Icon name="plus" size={16} /> Add extra
                </button>
              </div>
            ) : (
              <div className="review">
                <dl className="review-list">
                  <div><dt>Event</dt><dd>{event.name}</dd></div>
                  <div><dt>Category</dt><dd>{event.category}</dd></div>
                  <div><dt>When</dt><dd>{longDate(event)} · {shortTime(event)} · {event.durationHours} hours</dd></div>
                  <div><dt>Where</dt><dd>{event.mode === 'online' ? 'Online' : [event.venue, event.address, event.city, country.name].filter(Boolean).join(', ')}</dd></div>
                  <div><dt>Visibility</dt><dd>{event.isPrivate ? 'Private' : 'Public'}</dd></div>
                  <div>
                    <dt>Tickets</dt>
                    <dd>
                      {tickets.map((ticket) => (
                        <span key={ticket.id} className="review-ticket">
                          {ticket.name} · {ticket.price === 0 ? 'Free' : money(charges(ticket.price, ticket.charges === 'include').attendeePays, event.country)} · {ticket.quantity} available{ticket.seated ? ` · ${ticket.rows * ticket.seatsPerRow} seats` : ''}
                        </span>
                      ))}
                    </dd>
                  </div>
                  {uniforms.length > 0 && (
                    <div><dt>Extras</dt><dd>{uniforms.map((u) => u.name).filter(Boolean).join(', ')}</dd></div>
                  )}
                </dl>
                <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => setEvent({ published: true })}>
                  Publish
                </button>
              </div>
            )}

            {!(event.published && stage === 2) && (
              <div className="create-actions">
                {stage > 0 && (
                  <button type="button" className="btn btn--ghost" onClick={() => setStage(stage - 1)}>Back</button>
                )}
                {stage < 2 && (
                  <button type="button" className="btn btn--dark" disabled={!canContinue} onClick={() => setStage(stage + 1)}>
                    Continue <Icon name="arrowRight" size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="create-preview" aria-label="Live preview">
            <span className="preview-label"><Icon name="eye" size={14} /> Preview</span>
            <article className="event-card">
              <Cover cover={event.cover}>
                <span className="date-chip"><b>{day}</b>{month}</span>
                {event.isPrivate && <span className="private-chip"><Icon name="lock" size={12} /> Private</span>}
              </Cover>
              <div className="event-card-body">
                <small>{event.category}</small>
                <h4>{event.name || 'Your event name'}</h4>
                <p><Icon name="calendar" size={14} /> {longDate(event)} · {shortTime(event)}</p>
                <p><Icon name="pin" size={14} /> {locationLine(event)}</p>
                <div className="event-card-foot">
                  <span>{lowest === 0 ? 'Free' : `From ${money(lowest, event.country)}`}</span>
                  <span>{event.organiser}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
