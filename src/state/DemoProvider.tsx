import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createSeed } from './seed';
import type { ChatMessage, DemoState, DpState, EventDraft, Order, Ticket, Uniform } from './types';

export const STEPS = [
  { id: 'create', label: 'Create event', short: 'Create' },
  { id: 'page', label: 'Event page', short: 'Event' },
  { id: 'checkout', label: 'Checkout', short: 'Checkout' },
  { id: 'dp', label: 'DP Studio', short: 'DP Studio' },
  { id: 'chat', label: 'Messaging', short: 'Messaging' },
  { id: 'door', label: 'Ticket scanning', short: 'Scanning' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

interface StoredState extends DemoState {
  step: StepId;
}

type Action =
  | { type: 'event'; patch: Partial<EventDraft> }
  | { type: 'tickets'; tickets: Ticket[] }
  | { type: 'uniforms'; uniforms: Uniform[] }
  | { type: 'order'; patch: Partial<Order> }
  | { type: 'message'; message: ChatMessage }
  | { type: 'read'; reader: ChatMessage['from'] }
  | { type: 'dp'; patch: Partial<DpState> }
  | { type: 'step'; step: StepId }
  | { type: 'reset' };

const STORAGE_KEY = 'showrave-demo-v1';

function initialState(): StoredState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // Storage can be unavailable (private mode, blocked site data); fall back to the seed.
  }
  return { ...createSeed(), step: 'create' };
}

function reducer(state: StoredState, action: Action): StoredState {
  switch (action.type) {
    case 'event':
      return { ...state, event: { ...state.event, ...action.patch } };
    case 'tickets':
      return { ...state, tickets: action.tickets };
    case 'uniforms':
      return { ...state, uniforms: action.uniforms };
    case 'order':
      return { ...state, order: { ...state.order, ...action.patch } };
    case 'message':
      return { ...state, chat: [...state.chat, action.message] };
    case 'read':
      return {
        ...state,
        chat: state.chat.map((message) => (message.from !== action.reader && !message.read ? { ...message, read: true } : message)),
      };
    case 'dp':
      return { ...state, dp: { ...state.dp, ...action.patch } };
    case 'step':
      return { ...state, step: action.step };
    case 'reset':
      return { ...createSeed(), step: 'create' };
  }
}

interface DemoContextValue {
  state: StoredState;
  setEvent: (patch: Partial<EventDraft>) => void;
  setTickets: (tickets: Ticket[]) => void;
  setUniforms: (uniforms: Uniform[]) => void;
  setOrder: (patch: Partial<Order>) => void;
  sendMessage: (message: ChatMessage) => void;
  markRead: (reader: ChatMessage['from']) => void;
  setDp: (patch: Partial<DpState>) => void;
  goTo: (step: StepId, scroll?: boolean) => void;
  reset: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota or availability errors; the demo keeps working in memory.
    }
  }, [state]);

  const goTo = useCallback((step: StepId, scroll = false) => {
    dispatch({ type: 'step', step });
    if (scroll) document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      setEvent: (patch) => dispatch({ type: 'event', patch }),
      setTickets: (tickets) => dispatch({ type: 'tickets', tickets }),
      setUniforms: (uniforms) => dispatch({ type: 'uniforms', uniforms }),
      setOrder: (patch) => dispatch({ type: 'order', patch }),
      sendMessage: (message) => dispatch({ type: 'message', message }),
      markRead: (reader) => dispatch({ type: 'read', reader }),
      setDp: (patch) => dispatch({ type: 'dp', patch }),
      goTo,
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state, goTo],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}
