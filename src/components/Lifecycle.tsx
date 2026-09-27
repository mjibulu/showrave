import { useDemo, type StepId } from '../state/DemoProvider';

const STAGES: { title: string; text: string; step: StepId }[] = [
  { title: 'Publish', text: 'Tickets, seats, extras and pricing.', step: 'create' },
  { title: 'Promote', text: 'Create event display pictures.', step: 'dp' },
  { title: 'Sell', text: 'Checkout, coupons and digital tickets.', step: 'checkout' },
  { title: 'Support', text: 'Message attendees directly.', step: 'chat' },
  { title: 'Admit', text: 'Scan tickets online or offline.', step: 'door' },
];

export function Lifecycle() {
  const { goTo } = useDemo();

  return (
    <section className="lifecycle">
      <div className="shell">
        <div className="section-head section-head--light reveal">
          <p className="eyebrow eyebrow--light">How it works</p>
          <h2>From publishing to check-in.</h2>
        </div>

        <ol className="lifecycle-list">
          {STAGES.map((stage, index) => (
            <li key={stage.title} className="reveal">
              <button type="button" onClick={() => goTo(stage.step, true)}>
                <span className="lifecycle-num">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <strong>{stage.title}</strong>
                <p>{stage.text}</p>
                <span className="lifecycle-try">Try it →</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}