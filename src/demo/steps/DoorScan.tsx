import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useDemo } from '../../state/DemoProvider';
import { charges, money } from '../../lib/format';
import { orderSummary } from '../../lib/order';
import { BrowserFrame, PhoneFrame } from '../../components/Frames';
import { Switch } from '../../components/ui';
import { Icon } from '../../components/Icon';

type Result = 'valid' | 'admitted' | 'invalid' | 'expired';

interface ScanLog {
  id: number;
  ref: string;
  holder: string;
  result: Result;
  at: number;
  offline: boolean;
}

const RESULT_COPY: Record<Result, { title: string; icon: string }> = {
  valid: { title: 'Valid', icon: 'check' },
  admitted: { title: 'Admitted', icon: 'alert' },
  invalid: { title: 'Invalid', icon: 'x' },
  expired: { title: 'Expired', icon: 'clock' },
};

const BASE_ADMITTED = 186;
const GUEST_REF = 'SR-7KQ2M9XD';
const EXPIRED_REF = 'SR-2B4N8HPA';
const DAYS = 14;

function timeLabel(at: number) {
  return new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function DoorScan() {
  const { state, goTo } = useDemo();
  const { event, tickets, uniforms, order } = state;
  const summary = orderSummary(state);
  const myRef = order.paid ? order.ref : '';
  const [admitted, setAdmitted] = useState<Record<string, number>>({});
  const [log, setLog] = useState<ScanLog[]>([]);
  const [result, setResult] = useState<ScanLog | null>(null);
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);
  const [syncNote, setSyncNote] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState('');
  const [payout, setPayout] = useState<number | null>(null);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const sold = tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
  const capacity = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const extrasSold = uniforms.reduce((sum, uniform) => sum + uniform.sold, 0);
  const gross = tickets.reduce((sum, t) => sum + t.sold * charges(t.price, t.charges === 'include').attendeePays, 0)
    + uniforms.reduce((sum, u) => sum + u.sold * u.price, 0);
  const net = tickets.reduce((sum, t) => sum + t.sold * charges(t.price, t.charges === 'include').organiserGets, 0)
    + uniforms.reduce((sum, u) => sum + u.sold * charges(u.price, false).organiserGets, 0);
  const admittedCount = BASE_ADMITTED + Object.keys(admitted).length;
  const balance = payout === null ? net : 0;

  const days = useMemo(() => {
    const todayOrder = order.paid ? summary.ticketCount : 0;
    const base = [9, 14, 11, 22, 18, 25, 31, 19, 27, 36, 30, 41, 38, 46];
    return base.map((value, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (DAYS - 1 - i));
      return {
        label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        value: i === DAYS - 1 ? value + todayOrder : value,
      };
    });
  }, [order.paid, summary.ticketCount]);
  const maxDay = Math.max(...days.map((d) => d.value));

  const scan = (ref: string, holder: string) => {
    if (scanning) return;
    setScanning(true);
    setResult(null);
    timers.current.push(window.setTimeout(() => {
      const key = ref.trim().toUpperCase();
      let outcome: Result;
      if (key === EXPIRED_REF) outcome = 'expired';
      else if (key !== GUEST_REF && key !== myRef) outcome = 'invalid';
      else if (admitted[key]) outcome = 'admitted';
      else outcome = 'valid';
      const entry: ScanLog = { id: counter.current += 1, ref: key || 'Unknown', holder, result: outcome, at: Date.now(), offline };
      if (outcome === 'valid') setAdmitted((current) => ({ ...current, [key]: entry.at }));
      if (offline) setPending((count) => count + 1);
      setLog((current) => [entry, ...current].slice(0, 6));
      setResult(entry);
      setScanning(false);
    }, 700));
  };

  const toggleOffline = (value: boolean) => {
    setOffline(value);
    setSyncNote('');
    if (!value && pending > 0) {
      const count = pending;
      setSyncNote('Syncing…');
      timers.current.push(window.setTimeout(() => {
        setPending(0);
        setSyncNote(`${count} ${count === 1 ? 'scan' : 'scans'} synced · 0 conflicts`);
      }, 1400));
    }
  };

  const onManual = (e: FormEvent) => {
    e.preventDefault();
    if (!manual.trim()) return;
    const key = manual.trim().toUpperCase();
    scan(key, key === myRef ? order.attendee : key === GUEST_REF ? 'Jon Lewis' : 'Unknown');
    setManual('');
  };

  const firstAdmit = result && admitted[result.ref];

  return (
    <div className="door-grid">
      <PhoneFrame dark className="scanner-phone">
        <div className="scanner">
          <div className="scanner-head">
            <img src={`${import.meta.env.BASE_URL}assets/scanner-icon.png`} alt="" width="28" height="28" />
            <div>
              <strong>{event.name}</strong>
              <small>{sold} tickets synced</small>
            </div>
            <span className={`sync-pill ${offline ? 'is-offline' : ''}`}>
              {offline ? <><Icon name="wifiOff" size={12} /> Offline</> : 'Online'}
            </span>
          </div>

          <div className={`viewfinder ${scanning ? 'is-scanning' : ''} ${result ? `is-${result.result}` : ''}`}>
            <span className="corner" /><span className="corner" /><span className="corner" /><span className="corner" />
            <div className="scan-line" />
            {result ? (
              <div className="scan-result" role="status" aria-live="assertive">
                <span className="scan-result-icon"><Icon name={RESULT_COPY[result.result].icon} size={30} strokeWidth={2.8} /></span>
                <strong>{RESULT_COPY[result.result].title}</strong>
                <small>
                  {result.result === 'valid' && result.holder}
                  {result.result === 'admitted' && `Already admitted at ${firstAdmit ? timeLabel(firstAdmit) : ''}`}
                  {result.result === 'invalid' && 'Not a ticket for this event'}
                  {result.result === 'expired' && 'Ticket is for a past event'}
                </small>
              </div>
            ) : (
              <p>{scanning ? 'Checking…' : 'Choose a ticket to scan'}</p>
            )}
          </div>

          <div className="scan-options">
            <button type="button" onClick={() => (myRef ? scan(myRef, order.attendee) : goTo('checkout'))} disabled={scanning}>
              <Icon name="ticket" size={16} />
              <span>{myRef ? <>Your ticket <code>{myRef}</code></> : 'Book a ticket first'}</span>
            </button>
            <button type="button" onClick={() => scan(GUEST_REF, 'Jon Lewis')} disabled={scanning}>
              <Icon name="user" size={16} /><span>Guest ticket <code>{GUEST_REF}</code></span>
            </button>
            <button type="button" onClick={() => scan(EXPIRED_REF, 'Maya Singh')} disabled={scanning}>
              <Icon name="clock" size={16} /><span>Expired ticket</span>
            </button>
            <button type="button" onClick={() => scan('SR-UNKNOWN', 'Unknown')} disabled={scanning}>
              <Icon name="scan" size={16} /><span>Unknown QR code</span>
            </button>
          </div>

          <form className="manual-lookup" onSubmit={onManual}>
            <label htmlFor="manual-ref" className="sr-only">Ticket reference</label>
            <input id="manual-ref" value={manual} placeholder="Ticket reference" autoComplete="off" onChange={(e) => setManual(e.target.value)} />
            <button type="submit" className="btn btn--light btn--sm">Check</button>
          </form>

          <div className="door-stats">
            <div><strong>{log.length}</strong><span>Scanned</span></div>
            <div><strong>{admittedCount}</strong><span>Admitted</span></div>
            <div><strong>{Math.max(0, sold - admittedCount)}</strong><span>Remaining</span></div>
            <div><strong>{pending}</strong><span>To upload</span></div>
          </div>

          <div className="offline-row">
            <Switch checked={offline} onChange={toggleOffline} label="Offline mode" />
            {syncNote && <small role="status">{syncNote}</small>}
          </div>
        </div>
      </PhoneFrame>

      <BrowserFrame url="showrave.com/organiser/overview" className="overview-frame">
        <div className="overview">
          <div className="overview-head">
            <div>
              <small>{event.organiser}</small>
              <h4>{event.name}</h4>
            </div>
            <span className="chip chip--live"><span className="status-dot" /> Live</span>
          </div>

          <div className="kpis">
            <div className="kpi"><small>Tickets sold</small><strong>{sold}</strong><span>of {capacity}</span></div>
            <div className="kpi"><small>Gross sales</small><strong>{money(gross, event.country, 0)}</strong><span>incl. extras</span></div>
            <div className="kpi"><small>Extras sold</small><strong>{extrasSold}</strong></div>
            <div className="kpi"><small>Checked in</small><strong>{admittedCount}</strong><span>{sold ? Math.round((admittedCount / sold) * 100) : 0}% of tickets</span></div>
          </div>

          <div className="overview-grid">
            <section className="panel">
              <h5>Tickets sold per day</h5>
              <div className="bars" role="img" aria-label={`Tickets sold per day for the last ${DAYS} days. Today: ${days[DAYS - 1].value}.`} onMouseLeave={() => setHoverDay(null)}>
                {days.map((day, i) => (
                  <button
                    key={day.label}
                    type="button"
                    className={`bar ${i === DAYS - 1 ? 'is-today' : ''}`}
                    style={{ height: `${Math.max(6, (day.value / maxDay) * 100)}%` }}
                    onMouseEnter={() => setHoverDay(i)}
                    onFocus={() => setHoverDay(i)}
                    onBlur={() => setHoverDay(null)}
                    aria-label={`${day.label}: ${day.value} tickets`}
                  />
                ))}
                {hoverDay !== null && (
                  <span className="bar-tip" style={{ left: `${((hoverDay + 0.5) / DAYS) * 100}%` }}>
                    <b>{days[hoverDay].value}</b> tickets · {days[hoverDay].label}
                  </span>
                )}
              </div>
              <div className="bars-axis"><span>{days[0].label}</span><span>Today</span></div>
            </section>

            <section className="panel">
              <h5>By ticket type</h5>
              <ul className="capacity">
                {tickets.map((ticket) => {
                  const pct = ticket.quantity ? Math.round((ticket.sold / ticket.quantity) * 100) : 0;
                  return (
                    <li key={ticket.id}>
                      <div><span>{ticket.name}</span><span>{ticket.sold}/{ticket.quantity}</span></div>
                      <div className="meter"><span style={{ width: `${pct}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <div className="overview-grid">
            <section className="panel balance">
              <h5>Available balance</h5>
              <strong>{money(balance, event.country)}</strong>
              {payout === null ? (
                <button type="button" className="btn btn--dark btn--sm" disabled={balance <= 0} onClick={() => setPayout(net)}>Request payout</button>
              ) : (
                <p className="note note--ok"><Icon name="check" size={15} /> Payout of {money(payout, event.country)} requested</p>
              )}
            </section>

            <section className="panel">
              <h5>Recent orders</h5>
              <ul className="orders">
                {order.paid && (
                  <li className="is-new">
                    <span className="avatar avatar--rose avatar--sm">{order.attendee.slice(0, 2).toUpperCase()}</span>
                    <span><strong>{order.attendee}</strong><small>{summary.ticketCount} tickets · just now</small></span>
                    <b>{money(summary.total, event.country)}</b>
                  </li>
                )}
                <li>
                  <span className="avatar avatar--teal avatar--sm">JL</span>
                  <span><strong>Jon Lewis</strong><small>2 tickets · 18 min ago</small></span>
                  <b>{money(2 * charges(tickets[1]?.price ?? 20, false).attendeePays, event.country)}</b>
                </li>
                <li>
                  <span className="avatar avatar--gold avatar--sm">MS</span>
                  <span><strong>Maya Singh</strong><small>1 ticket · 1 hr ago</small></span>
                  <b>{money(charges(tickets[1]?.price ?? 20, false).attendeePays, event.country)}</b>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </BrowserFrame>
    </div>
  );
}
