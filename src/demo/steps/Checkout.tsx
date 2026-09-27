import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useDemo } from '../../state/DemoProvider';
import { longDate, locationLine, money, shortTime } from '../../lib/format';
import { COUPON_AMOUNT, COUPON_CODE, orderRef, orderSummary, seatMap, seatedTicket } from '../../lib/order';
import { BrowserFrame, Cover } from '../../components/Frames';
import { Field } from '../../components/ui';
import { Icon } from '../../components/Icon';

const HOLD_SECONDS = 600;

export function Checkout() {
  const { state, setOrder, setTickets, setUniforms, goTo } = useDemo();
  const { event, order, tickets, uniforms } = state;
  const summary = orderSummary(state);
  const seated = seatedTicket(state);
  const seatQty = seated ? order.lines[seated.id] ?? 0 : 0;
  const rows = useMemo(() => (seated ? seatMap(seated, order.bookedSeats) : []), [seated, order.bookedSeats]);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [paying, setPaying] = useState(false);
  const [holdLeft, setHoldLeft] = useState<number | null>(order.seats.length ? HOLD_SECONDS : null);
  const [qr, setQr] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [walletNote, setWalletNote] = useState('');

  useEffect(() => {
    if (holdLeft === null || order.paid) return;
    if (holdLeft <= 0) {
      setOrder({ seats: [] });
      setHoldLeft(null);
      return;
    }
    const timer = window.setTimeout(() => setHoldLeft(holdLeft - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [holdLeft, order.paid, setOrder]);

  useEffect(() => {
    if (!order.paid || !order.ref) return;
    QRCode.toDataURL(`SHOWRAVE:${order.ref}`, { margin: 1, width: 360, color: { dark: '#161821', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [order.paid, order.ref]);

  const toggleSeat = (id: string) => {
    if (order.seats.includes(id)) {
      setOrder({ seats: order.seats.filter((seat) => seat !== id) });
      return;
    }
    if (order.seats.length >= seatQty) {
      setOrder({ seats: [...order.seats.slice(1), id] });
    } else {
      setOrder({ seats: [...order.seats, id] });
    }
    if (holdLeft === null) setHoldLeft(HOLD_SECONDS);
  };

  const applyCoupon = () => {
    if (couponInput.trim().toUpperCase() === COUPON_CODE) {
      setOrder({ coupon: COUPON_CODE });
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      setTickets(tickets.map((ticket) => ({ ...ticket, sold: ticket.sold + (order.lines[ticket.id] ?? 0) })));
      setUniforms(uniforms.map((uniform) => ({ ...uniform, sold: uniform.sold + (order.uniforms[uniform.id] ?? 0) })));
      setOrder({ paid: true, ref: orderRef(), bookedSeats: [...order.bookedSeats, ...order.seats], transferredTo: null });
      setPaying(false);
      setHoldLeft(null);
    }, 1300);
  };

  const bookAgain = () => {
    setOrder({ lines: {}, uniforms: {}, seats: [], coupon: null, paid: false, ref: '', transferredTo: null });
    setQr('');
    goTo('page');
  };

  const quickAdd = () => {
    const ticket = tickets.find((t) => t.quantity - t.sold > 0 && !t.seated) ?? tickets.find((t) => t.quantity - t.sold > 0);
    if (ticket) setOrder({ lines: { ...order.lines, [ticket.id]: Math.min(2, ticket.limit) } });
  };

  const seatsReady = !seated || seatQty === 0 || order.seats.length === seatQty;
  const nameReady = order.attendee.trim().length > 1;

  if (order.paid) {
    return (
      <BrowserFrame url="showrave.com/account/tickets">
        <div className="ticket-done">
          <div className="ticket-done-copy">
            <span className="success-mark"><Icon name="check" size={28} strokeWidth={2.6} /></span>
            <h3>Order confirmed</h3>
            <p>Order {order.ref}. Tickets are in your account and email.</p>
            <div className="wallet-row">
              <button type="button" className="wallet-btn" onClick={() => setWalletNote('Add to Apple Wallet from the ShowRave app.')}>
                <Icon name="wallet" size={18} /> Add to Apple Wallet
              </button>
              <button type="button" className="wallet-btn" onClick={() => setWalletNote('Add to Google Wallet from the ShowRave app.')}>
                <Icon name="wallet" size={18} /> Add to Google Wallet
              </button>
            </div>
            {walletNote && <p className="note" role="status">{walletNote}</p>}

            {transferOpen && !order.transferredTo ? (
              <form
                className="transfer-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (/\S+@\S+\.\S+/.test(transferTo)) {
                    setOrder({ transferredTo: transferTo });
                    setTransferOpen(false);
                  }
                }}
              >
                <Field label="Recipient email">
                  {(id) => <input id={id} type="email" required value={transferTo} placeholder="friend@example.com" onChange={(e) => setTransferTo(e.target.value)} />}
                </Field>
                <div className="row-actions">
                  <button type="submit" className="btn btn--dark btn--sm">Transfer</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTransferOpen(false)}>Cancel</button>
                </div>
              </form>
            ) : order.transferredTo ? (
              <p className="note note--ok" role="status"><Icon name="swap" size={16} /> Transfer sent to {order.transferredTo}. They accept it by email.</p>
            ) : (
              <div className="row-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTransferOpen(true)}><Icon name="swap" size={15} /> Transfer ticket</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={bookAgain}>Book more</button>
              </div>
            )}

            <div className="row-actions">
              <button type="button" className="btn btn--primary" onClick={() => goTo('dp')}>
                Create a DP <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>

          <div className="eticket">
            <Cover cover={event.cover} className="eticket-cover">
              <strong>{event.name}</strong>
            </Cover>
            <div className="eticket-body">
              <div className="eticket-grid">
                <div><small>Date</small><span>{longDate(event)}</span></div>
                <div><small>Time</small><span>{shortTime(event)}</span></div>
                <div><small>Venue</small><span>{locationLine(event)}</span></div>
                <div><small>Holder</small><span>{order.attendee}</span></div>
                {order.seats.length > 0 && <div><small>Seats</small><span>{order.seats.join(', ')}</span></div>}
                <div><small>Admits</small><span>{summary.ticketCount}</span></div>
              </div>
              <div className="eticket-tear" aria-hidden="true" />
              <div className="eticket-qr">
                {qr ? <img src={qr} alt={`QR code for order ${order.ref}`} width="170" height="170" /> : <div className="qr-placeholder" />}
                <code>{order.ref}</code>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
    );
  }

  return (
    <BrowserFrame url="showrave.com/checkout">
      <div className="checkout">
        {summary.ticketCount === 0 ? (
          <div className="empty-state">
            <Icon name="ticket" size={34} />
            <h3>No tickets selected</h3>
            <div className="row-actions">
              <button type="button" className="btn btn--primary" onClick={quickAdd}>Add 2 tickets</button>
              <button type="button" className="btn btn--ghost" onClick={() => goTo('page')}>Back to event</button>
            </div>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="checkout-main">
              {seated && seatQty > 0 && (
                <section className="seat-section">
                  <div className="seat-head">
                    <div>
                      <h4>Choose {seatQty} {seatQty === 1 ? 'seat' : 'seats'}</h4>
                      <small>{seated.name} · {order.seats.length}/{seatQty} selected</small>
                    </div>
                    {holdLeft !== null && order.seats.length > 0 && (
                      <span className="hold-timer" role="timer">
                        <Icon name="clock" size={14} /> Held for {Math.floor(holdLeft / 60)}:{String(holdLeft % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div className="stage-bar">Stage</div>
                  <div className="seat-map" role="group" aria-label="Seat map">
                    {rows.map((row) => (
                      <div className="seat-row" key={row[0].row}>
                        <span className="seat-row-label">{row[0].row}</span>
                        {row.map((seat) => {
                          const selected = order.seats.includes(seat.id);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              className={`seat seat--${selected ? 'selected' : seat.status}`}
                              disabled={seat.status !== 'open'}
                              aria-pressed={selected}
                              aria-label={`Seat ${seat.id}${seat.status === 'sold' ? ', sold' : seat.status === 'blocked' ? ', unavailable' : ''}`}
                              onClick={() => toggleSeat(seat.id)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="seat-legend">
                    <span><i className="seat seat--open" /> Available</span>
                    <span><i className="seat seat--selected" /> Selected</span>
                    <span><i className="seat seat--sold" /> Sold</span>
                    <span><i className="seat seat--blocked" /> Unavailable</span>
                  </div>
                </section>
              )}

              <section className="form-stack">
                <h4>Attendee</h4>
                <div className="form-row">
                  <Field label="Full name">
                    {(id) => <input id={id} value={order.attendee} autoComplete="off" onChange={(e) => setOrder({ attendee: e.target.value })} />}
                  </Field>
                  <Field label="Email">
                    {(id) => <input id={id} type="email" defaultValue="major@example.com" autoComplete="off" />}
                  </Field>
                </div>
                <div className="pay-card" aria-hidden="true">
                  <Icon name="lock" size={16} />
                  <span>Card ending 4242</span>
                  <small>Test card</small>
                </div>
              </section>
            </div>

            <aside className="order-box">
              <h4>Order summary</h4>
              <p className="order-event">{event.name} · {longDate(event)}</p>
              <ul className="order-lines">
                {summary.lines.map((line) => (
                  <li key={line.id}>
                    <span>{line.qty} × {line.label}</span>
                    <span>{money(line.total, event.country)}</span>
                  </li>
                ))}
                {summary.discount > 0 && (
                  <li className="order-discount">
                    <span>Coupon {order.coupon}</span>
                    <span>−{money(summary.discount, event.country)}</span>
                  </li>
                )}
              </ul>
              {!order.coupon ? (
                <div className="coupon">
                  <label className="sr-only" htmlFor="coupon">Coupon code</label>
                  <input id="coupon" placeholder="Coupon code" value={couponInput} maxLength={11} onChange={(e) => setCouponInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyCoupon()} />
                  <button type="button" className="btn btn--dark btn--sm" onClick={applyCoupon}>Apply</button>
                </div>
              ) : (
                <p className="note note--ok"><Icon name="check" size={15} /> {money(COUPON_AMOUNT, event.country)} off</p>
              )}
              {couponError && <p className="field-error" role="alert">{couponError}</p>}
              <div className="order-total">
                <span>Total</span>
                <strong>{money(summary.total, event.country)}</strong>
              </div>
              <button type="button" className="btn btn--primary btn--block btn--lg" disabled={!seatsReady || !nameReady || paying} onClick={pay}>
                {paying ? <span className="spinner" aria-label="Processing payment" /> : summary.total === 0 ? 'Get tickets' : `Pay ${money(summary.total, event.country)}`}
              </button>
              {!seatsReady && <small className="field-hint">Choose seats to continue.</small>}
            </aside>
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}
