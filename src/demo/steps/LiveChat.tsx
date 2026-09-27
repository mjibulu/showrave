import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useDemo } from '../../state/DemoProvider';
import type { ChatMessage, EventDraft } from '../../state/types';
import { longDate, shortTime, uid } from '../../lib/format';
import { readImageFile } from '../../lib/image';
import { BrowserFrame, PhoneFrame } from '../../components/Frames';
import { Segmented } from '../../components/ui';
import { Icon } from '../../components/Icon';

type Side = ChatMessage['from'];

const BLOCKED = /(https?:\/\/|www\.|\b[\w.+-]+@[\w-]+\.[\w.]+|\b[\w-]+\.(com|net|org|io|co|uk|me|app)\b)/i;

function organiserReply(text: string, event: EventDraft, attendee: string): string {
  const first = attendee.split(' ')[0] || 'there';

  if (/refund|cancel/i.test(text)) {
    return `Hi ${first}, send your order number and we'll check the refund options.`;
  }

  if (/transfer|friend|name/i.test(text)) {
    return 'Open the ticket in your account and choose Transfer. The recipient accepts it by email.';
  }

  if (/park|car|drive/i.test(text)) {
    return `Parking near ${event.venue || 'the venue'} is limited. Public transport is recommended.`;
  }

  if (/time|door|open|start|late/i.test(text)) {
    return `Doors open at ${shortTime(event)} on ${longDate(event)}. Arrive early.`;
  }

  if (/dress|wear/i.test(text)) {
    return "There's no dress code.";
  }

  if (/age|id\b|18/i.test(text)) {
    return 'This event is 18+. Bring photo ID.';
  }

  return `Thanks, ${first}. I'll check and get back to you.`;
}

const ATTENDEE_REPLIES = [
  'Thanks!',
  'Great, see you there.',
  'That helps, thanks.',
];

function timeLabel(at: number) {
  return new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const onChange = () => setNarrow(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

interface ThreadProps {
  me: Side;
  messages: ChatMessage[];
  otherTyping: boolean;
  otherName: string;
  onSend: (text: string, image?: string) => void;
  onTyping: () => void;
}

function Thread({ me, messages, otherTyping, otherName, onSend, onTyping }: ThreadProps) {
  const [text, setText] = useState('');
  const [blocked, setBlocked] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, otherTyping]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    if (BLOCKED.test(value)) {
      setBlocked(true);
      return;
    }
    onSend(value);
    setText('');
  };

  const attach = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      onSend('', await readImageFile(file, 520));
    } catch {
      // Unreadable image; ignore.
    }
  };

  const inputId = `composer-${me}`;
  const fileId = `attach-${me}`;

  return (
    <div className="thread">
      <div className="thread-body" ref={bodyRef} aria-live="polite">
        {messages.map((message) => {
          const mine = message.from === me;
          return (
            <div key={message.id} className={`bubble ${mine ? 'bubble--mine' : 'bubble--theirs'}`}>
              {message.image && <img src={message.image} alt="Attached image" />}
              {message.text && <p>{message.text}</p>}
              <span className="bubble-meta">
                {timeLabel(message.at)}
                {mine && (
                  <span className={`ticks ${message.read ? 'is-read' : ''}`} aria-label={message.read ? 'Read' : 'Sent'}>
                    <Icon name="check" size={13} strokeWidth={2.6} />
                    {message.read && <Icon name="check" size={13} strokeWidth={2.6} />}
                  </span>
                )}
              </span>
            </div>
          );
        })}
        {otherTyping && (
          <div className="bubble bubble--theirs bubble--typing" aria-label={`${otherName} is typing`}>
            <span /><span /><span />
          </div>
        )}
      </div>
      {blocked && (
  <p className="blocked-note" role="alert">
    <Icon name="alert" size={14} /> Links and email addresses aren't allowed.
    <button
      type="button"
      className="icon-btn"
      aria-label="Dismiss"
      onClick={() => setBlocked(false)}
    >
      <Icon name="x" size={14} />
    </button>
  </p>
)}
      <form className="composer" onSubmit={submit}>
        <input type="file" accept="image/*" id={fileId} className="sr-only" onChange={(e) => { attach(e.target.files?.[0]); e.target.value = ''; }} />
        <label htmlFor={fileId} className="icon-btn" aria-label="Attach an image"><Icon name="paperclip" size={18} /></label>
        <label htmlFor={inputId} className="sr-only">Message</label>
        <input
          id={inputId}
          value={text}
          placeholder="Message"
          autoComplete="off"
          onChange={(e) => { setText(e.target.value); setBlocked(false); onTyping(); }}
        />
        <button type="submit" className="send-btn" aria-label="Send" disabled={!text.trim()}><Icon name="send" size={17} /></button>
      </form>
    </div>
  );
}

const SUPPORT_ANSWERS: [RegExp, string][] = [
  [/refund|money back/i, "Send your order number and we'll check the refund options."],
  [/transfer|friend/i, 'Open the ticket and choose Transfer. The recipient accepts it by email.'],
  [/ticket|email|find/i, 'Find your tickets under Account > Tickets or in your confirmation email.'],
  [/password|login|sign/i, 'Use Forgot password on the sign-in page.'],
];

interface SupportMessage { id: string; from: 'visitor' | 'bot' | 'agent' | 'system'; text: string }

function SupportWidget({ visitor }: { visitor: string }) {
  const [messages, setMessages] = useState<SupportMessage[]>([
    { id: 's0', from: 'bot', text: `Hi ${visitor.split(' ')[0] || 'there'}. How can I help?` },
  ]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const timers = useRef<number[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typing]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const add = (message: Omit<SupportMessage, 'id'>) => setMessages((list) => [...list, { ...message, id: uid('s') }]);

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    add({ from: 'visitor', text: value });
    setText('');
    setTyping(true);
    later(() => {
      setTyping(false);
      if (escalated) {
        add({ from: 'agent', text: "I'll check your account." });
        return;
      }
      const answer = SUPPORT_ANSWERS.find(([pattern]) => pattern.test(value))?.[1];
      add({ from: 'bot', text: answer ?? "I can't answer that. You can talk to support." });
    }, 1300);
  };

  const connect = () => {
    setEscalated(true);
    add({ from: 'system', text: 'Connecting to support...' });
    later(() => setTyping(true), 900);
    later(() => {
      setTyping(false);
      add({ from: 'agent', text: "Hi, I'm Sam. How can I help?" });
    }, 2600);
  };

  return (
    <BrowserFrame url="showrave.com/live-chat" className="support-frame">
      <div className="support">
        <div className="support-head">
          <span className="avatar avatar--wine">{escalated ? 'S' : <Icon name="bot" size={18} />}</span>
          <div>
            <strong>{escalated ? 'Sam · ShowRave support' : 'ShowRave assistant'}</strong>
            <small><span className="status-dot" /> Online</small>
          </div>
        </div>
        <div className="thread-body" ref={bodyRef} aria-live="polite">
          {messages.map((message) =>
            message.from === 'system' ? (
              <p key={message.id} className="system-line">{message.text}</p>
            ) : (
              <div key={message.id} className={`bubble ${message.from === 'visitor' ? 'bubble--mine' : 'bubble--theirs'}`}>
                <p>{message.text}</p>
              </div>
            ),
          )}
          {typing && <div className="bubble bubble--theirs bubble--typing" aria-label="Typing"><span /><span /><span /></div>}
          {!escalated && messages.length > 1 && !typing && (
            <button type="button" className="btn btn--ghost btn--sm connect-btn" onClick={connect}>
              <Icon name="user" size={15} /> Talk to support
            </button>
          )}
        </div>
        <form className="composer" onSubmit={ask}>
          <label htmlFor="support-input" className="sr-only">Message</label>
          <input id="support-input" value={text} placeholder="Ask a question" autoComplete="off" onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="send-btn" aria-label="Send" disabled={!text.trim()}><Icon name="send" size={17} /></button>
        </form>
      </div>
    </BrowserFrame>
  );
}

export function LiveChat() {
  const { state, sendMessage, markRead } = useDemo();
  const { chat, event, order } = state;
  const narrow = useIsNarrow();
  const [mode, setMode] = useState<'direct' | 'support'>('direct');
  const [active, setActive] = useState<Side>('attendee');
  const [typing, setTyping] = useState<Side | null>(null);
  const typingTimer = useRef<number | null>(null);
  const replyTimers = useRef<number[]>([]);
  const attendee = order.attendee || 'Major King';
  const initials = attendee.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const orgInitials = event.organiser.slice(0, 2).toUpperCase();

  const visible = (side: Side) => mode === 'direct' && (!narrow || active === side);

  useEffect(() => () => {
    replyTimers.current.forEach((timer) => window.clearTimeout(timer));
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
  }, []);

  // Mark messages read once the other side's screen is showing them.
  useEffect(() => {
    const pending = (reader: Side) => chat.some((message) => message.from !== reader && !message.read);
    const readers = (['attendee', 'organiser'] as Side[]).filter((reader) => visible(reader) && pending(reader));
    if (!readers.length) return;
    const timer = window.setTimeout(() => readers.forEach(markRead), 900);
    return () => window.clearTimeout(timer);
  }, [chat, narrow, active, mode]);

  const clearReplies = () => {
    replyTimers.current.forEach((timer) => window.clearTimeout(timer));
    replyTimers.current = [];
  };

  const onTyping = (side: Side) => {
    clearReplies();
    setTyping(side);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(null), 1500);
  };

  const send = (from: Side, text: string, image?: string) => {
    clearReplies();
    setTyping(null);
    sendMessage({ id: uid('m'), from, text, image, at: Date.now(), read: false });
    const other: Side = from === 'attendee' ? 'organiser' : 'attendee';
    const reply = from === 'attendee'
      ? organiserReply(text || 'photo', event, attendee)
      : ATTENDEE_REPLIES[chat.filter((m) => m.from === 'attendee').length % ATTENDEE_REPLIES.length];
    replyTimers.current.push(
      window.setTimeout(() => setTyping(other), 3200),
      window.setTimeout(() => {
        setTyping(null);
        sendMessage({ id: uid('m'), from: other, text: reply, at: Date.now(), read: false });
      }, 5200),
    );
  };

  const unreadFor = (reader: Side) => chat.filter((message) => message.from !== reader && !message.read).length;
  const last = chat[chat.length - 1];

  return (
    <div className="chat-step">
      <div className="chat-switches">
        <Segmented
          label="Chat type"
          value={mode}
          onChange={setMode}
          options={[{ value: 'direct', label: 'Direct messages' }, { value: 'support', label: 'Live support' }]}
        />
        {mode === 'direct' && narrow && (
          <div className="segmented" role="tablist" aria-label="View as">
            {(['attendee', 'organiser'] as Side[]).map((side) => (
              <button key={side} type="button" role="tab" aria-selected={active === side} className={active === side ? 'is-active' : ''} onClick={() => setActive(side)}>
                {side === 'attendee' ? 'Attendee' : 'Organiser'}
                {active !== side && unreadFor(side) > 0 && <span className="badge">{unreadFor(side)}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === 'support' ? (
        <SupportWidget visitor={attendee} />
      ) : (
        <div className="chat-grid">
          {visible('attendee') && (
            <PhoneFrame className="chat-phone">
              <div className="app-chat-head">
                <Icon name="arrowLeft" size={18} />
                <span className="avatar avatar--wine avatar--sm">{orgInitials}</span>
                <div>
                  <strong>{event.organiser}</strong>
                  <small>{typing === 'organiser' ? 'typing…' : <><span className="status-dot" /> Online</>}</small>
                </div>
              </div>
              <Thread
                me="attendee"
                messages={chat}
                otherTyping={typing === 'organiser'}
                otherName={event.organiser}
                onSend={(text, image) => send('attendee', text, image)}
                onTyping={() => onTyping('attendee')}
              />
            </PhoneFrame>
          )}

          {visible('organiser') && (
            <BrowserFrame url="showrave.com/organiser/messages" className="inbox-frame">
              <div className="inbox">
                <div className="inbox-list">
                  <div className="inbox-list-head"><strong>Messages</strong></div>
                  <button type="button" className="inbox-item is-active">
                    <span className="avatar avatar--rose avatar--sm">{initials}</span>
                    <span className="inbox-item-text">
                      <strong>{attendee}</strong>
                      <small>{typing === 'attendee' ? 'typing…' : last?.image ? 'Sent an image' : last?.text}</small>
                    </span>
                    {unreadFor('organiser') > 0 && <span className="badge">{unreadFor('organiser')}</span>}
                  </button>
                  <div className="inbox-item">
                    <span className="avatar avatar--teal avatar--sm">JL</span>
                    <span className="inbox-item-text"><strong>Jon Lewis</strong><small>Thanks, that worked.</small></span>
                  </div>
                  <div className="inbox-item">
                    <span className="avatar avatar--gold avatar--sm">MS</span>
                    <span className="inbox-item-text"><strong>Maya Singh</strong><small>Is there step-free access?</small></span>
                  </div>
                </div>
                <div className="inbox-thread">
                  <div className="inbox-thread-head">
                    <span className="avatar avatar--rose avatar--sm">{initials}</span>
                    <div>
                      <strong>{attendee}</strong>
                      <small>{typing === 'attendee' ? 'typing…' : `Attendee · ${event.name}`}</small>
                    </div>
                  </div>
                  <Thread
                    me="organiser"
                    messages={chat}
                    otherTyping={typing === 'attendee'}
                    otherName={attendee}
                    onSend={(text, image) => send('organiser', text, image)}
                    onTyping={() => onTyping('organiser')}
                  />
                </div>
              </div>
            </BrowserFrame>
          )}
        </div>
      )}
    </div>
  );
}
