import { useEffect, useRef, type KeyboardEvent } from 'react';
import { STEPS, useDemo, type StepId } from '../state/DemoProvider';
import { Icon } from '../components/Icon';
import { CreateEvent } from './steps/CreateEvent';
import { EventPage } from './steps/EventPage';
import { Checkout } from './steps/Checkout';
import { DpGenerator } from './steps/DpGenerator';
import { LiveChat } from './steps/LiveChat';
import { DoorScan } from './steps/DoorScan';

const GUIDE: Record<StepId, { role: string; title: string; tips: string[] }> = {
  create: {
    role: 'Organiser',
    title: 'Create an event',
    tips: [
      'Edit the event and watch the preview.',
      'Change the country and currency.',
      'Add tickets, charges or a seat map.',
    ],
  },
  page: {
    role: 'Attendee',
    title: 'Event page',
    tips: [
      'Choose tickets and extras.',
      'Add the event to your calendar.',
      'Switch the language.',
    ],
  },
  checkout: {
    role: 'Attendee',
    title: 'Checkout',
    tips: [
      'Choose seats on the map.',
      'Apply RAVE10.',
      'Pay to generate a QR ticket.',
    ],
  },
  dp: {
    role: 'Attendee',
    title: 'DP Studio',
    tips: [
      'Upload, move and zoom your photo.',
      'Try different templates.',
      'Download or share the result.',
    ],
  },
  chat: {
    role: 'Attendee + organiser',
    title: 'Messaging',
    tips: [
      'Send and reply from both sides.',
      'Attach an image or link.',
      'See typing and read receipts.',
    ],
  },
  door: {
    role: 'Door team',
    title: 'Ticket scanning',
    tips: [
      'Scan the ticket twice.',
      'Try scanning offline.',
      'Reconnect to sync.',
    ],
  },
};

function StepView({ step }: { step: StepId }) {
  switch (step) {
    case 'create': return <CreateEvent />;
    case 'page': return <EventPage />;
    case 'checkout': return <Checkout />;
    case 'dp': return <DpGenerator />;
    case 'chat': return <LiveChat />;
    case 'door': return <DoorScan />;
  }
}

export function DemoStudio() {
  const { state, goTo, reset } = useDemo();
  const index = STEPS.findIndex((step) => step.id === state.step);
  const guide = GUIDE[state.step];
  const prev = STEPS[index - 1];
  const next = STEPS[index + 1];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    tabRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [index]);

  const onTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    event.preventDefault();

    const nextIndex =
      (index + (event.key === 'ArrowRight' ? 1 : -1) + STEPS.length) %
      STEPS.length;

    goTo(STEPS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const renderNav = (bottom: boolean) => (
    <div className={`demo-nav ${bottom ? 'demo-nav--bottom' : ''}`}>
      {prev && (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => goTo(prev.id, bottom)}
        >
          <Icon name="arrowLeft" size={16} /> {prev.short}
        </button>
      )}

      {next && (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => goTo(next.id, bottom)}
        >
          Next: {next.label} <Icon name="arrowRight" size={16} />
        </button>
      )}
    </div>
  );

  return (
    <section className="demo" id="demo">
      <div className="shell">
        <div className="demo-head reveal">
          <div>
            <p className="eyebrow">Live demo</p>
            <h2>Try the event flow.</h2>
          </div>

          <div className="demo-head-side">
            <p>Nothing is saved or charged.</p>

            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={reset}
            >
              <Icon name="refresh" size={16} /> Reset
            </button>
          </div>
        </div>

        <div
          className="stepper"
          role="tablist"
          aria-label="Demo steps"
          onKeyDown={onTabKey}
        >
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              ref={(node) => {
                tabRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${step.id}`}
              aria-selected={step.id === state.step}
              aria-controls="demo-panel"
              tabIndex={step.id === state.step ? 0 : -1}
              className={`step-tab ${i < index ? 'is-done' : ''}`}
              onClick={() => goTo(step.id)}
            >
              <span className="step-num">
                {i < index ? (
                  <Icon name="check" size={14} strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>

              <span className="step-label">{step.label}</span>
            </button>
          ))}
        </div>

        <div className="demo-body">
          <aside className="demo-guide" aria-live="polite">
            <span className="role-pill">{guide.role}</span>
            <h3>{guide.title}</h3>

            <ul>
              {guide.tips.map((tip) => (
                <li key={tip}>
                  <Icon name="sparkle" size={16} /> {tip}
                </li>
              ))}
            </ul>

            {renderNav(false)}
          </aside>

          <div
            className="demo-stage"
            id="demo-panel"
            role="tabpanel"
            aria-labelledby={`tab-${state.step}`}
            key={state.step}
          >
            <StepView step={state.step} />
            {renderNav(true)}
          </div>
        </div>
      </div>
    </section>
  );
}