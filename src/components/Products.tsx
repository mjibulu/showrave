const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

const PRODUCTS = [
  {
    name: 'ShowRave web platform',
    image: 'portfolio/showrave-platform.png',
    text: 'Events, tickets, sales, payouts and reports.',
    link: { href: 'https://showrave.com', label: 'showrave.com' },
    wide: true,
  },
  {
    name: 'ShowRave app',
    image: 'portfolio/showrave-app.png',
    text: 'Book tickets and manage events.',
    link: { href: 'https://showrave.com/apps', label: 'Get the app' },
  },
  {
    name: 'Ticket Scanner',
    image: 'portfolio/ticket-scanner.png',
    text: 'Scan tickets online or offline.',
    link: { href: 'https://showrave.com/apps', label: 'Get the app' },
  },
  {
    name: 'Messaging',
    image: 'portfolio/showrave-messaging.png',
    text: 'Messages between attendees and organisers.',
    link: { href: 'https://showrave.com/live-chat.php', label: 'Open messaging' },
  },
  {
    name: 'DP Studio',
    image: 'portfolio/dp-studio.png',
    text: 'Create and share event display pictures.',
    link: { href: 'https://dp.showrave.com', label: 'dp.showrave.com' },
  },
];

const APPS = [
  {
    name: 'ShowRave',
    icon: 'main-app-icon.png',
    text: 'Tickets and event management.',
    ios: 'https://apps.apple.com/us/app/showrave-events-tickets/id6758464948',
    android: 'https://play.google.com/store/apps/details?id=com.showrave.mainapp',
  },
  {
    name: 'Ticket Scanner',
    icon: 'scanner-icon.png',
    text: 'Ticket check-in, online or offline.',
    ios: 'https://apps.apple.com/us/app/ticket-scanner-showrave/id6758725925',
    android: 'https://play.google.com/store/apps/details?id=com.showrave.ticketscanner',
  },
];

export function Products() {
  return (
    <section className="products" id="products">
      <div className="shell">
        <div className="section-head reveal">
          <p className="eyebrow">Products</p>
          <h2>The ShowRave platform</h2>
          <p>Ticketing, event management, messaging and check-in.</p>
        </div>

        <div className="product-grid">
          {PRODUCTS.map((product) => (
            <article
              key={product.name}
              className={`product-card reveal ${product.wide ? 'product-card--wide' : ''}`}
            >
              <div className="product-shot">
                <img
                  src={asset(product.image)}
                  alt={`${product.name} screens`}
                  loading="lazy"
                />
              </div>

              <div className="product-body">
                <h3>{product.name}</h3>
                <p>{product.text}</p>
                <a
                  href={product.link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {product.link.label} ↗
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="apps-band reveal" id="apps">
          {APPS.map((app) => (
            <div className="app-row" key={app.name}>
              <img
                className="app-icon"
                src={asset(app.icon)}
                alt=""
                width="56"
                height="56"
                loading="lazy"
              />

              <div>
                <strong>{app.name}</strong>
                <span>{app.text}</span>
              </div>

              <div className="store-badges">
                <a href={app.ios} target="_blank" rel="noreferrer">
                  <img
                    src={asset('appstore.png')}
                    alt={`Download ${app.name} on the App Store`}
                    loading="lazy"
                  />
                </a>

                <a href={app.android} target="_blank" rel="noreferrer">
                  <img
                    src={asset('googleplay.png')}
                    alt={`Get ${app.name} on Google Play`}
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}