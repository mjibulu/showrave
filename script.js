const data = window.ShowRaveMockData || {};

const burger = document.getElementById("burger");
const drawer = document.getElementById("drawer");
const backdrop = document.getElementById("backdrop");
const drawerClose = document.getElementById("drawerClose");

const setDrawer = (open) => {
  if (!drawer || !backdrop) return;
  drawer.classList.toggle("open", open);
  backdrop.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  if (burger) burger.setAttribute("aria-expanded", String(open));
};

if (burger && drawer && backdrop && drawerClose) {
  burger.addEventListener("click", () => setDrawer(true));
  drawerClose.addEventListener("click", () => setDrawer(false));
  backdrop.addEventListener("click", () => setDrawer(false));
  drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setDrawer(false)));
}

document.querySelectorAll("[data-snap]").forEach((button) => {
  button.addEventListener("click", () => {
    const rail = document.querySelector(button.getAttribute("data-snap"));
    if (!rail) return;
    const amount = rail.clientWidth * 0.9 * Number(button.getAttribute("data-dir") || 1);
    rail.scrollBy({ left: amount, behavior: "smooth" });
  });
});

const year = document.getElementById("yr");
if (year) year.textContent = new Date().getFullYear();

const createStars = () => '<div class="stars" aria-label="5 out of 5 stars">' + new Array(5).fill('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 17.3l-6.18 3.73 1.64-7.03L2 9.97l7.19-.62L12 2.75l2.81 6.6L22 9.97l-5.46 4.03 1.64 7.03z"></path></svg>').join('') + '</div>';

const createEventCard = (item, href = "./event.html") => `
  <article class="card event-card" role="listitem">
    <div class="media media--gradient media--${item.theme}">
      <div class="media-copy">
        <span class="badge">${item.category}</span>
        <span class="ticket">${item.ticket}</span>
      </div>
      <button class="bookmark" aria-label="Save event" aria-pressed="false">
        <svg class="bm-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        <svg class="bm-on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2z"></path></svg>
      </button>
      <div class="hero-card-title">${item.name}</div>
    </div>
    <div class="body">
      <div class="meta-row">
        <div class="left-meta">
          <div class="badge">${item.category}</div>
          <div class="ticket">${item.place}</div>
        </div>
        <div class="from"><span class="muted">From</span><span class="price">${item.price}</span></div>
      </div>
      <h5><a href="${href}">${item.name}</a></h5>
      <div class="muted">${item.time}</div>
      <div class="bottom-row">
        <a class="pill pill--sm" href="${href}">Book</a>
        <div class="countdown-grid" aria-label="Countdown">
          <div class="cd"><div class="num">${item.days}</div><div class="lbl">Days</div></div>
          <div class="cd"><div class="num">${item.hrs}</div><div class="lbl">Hrs</div></div>
          <div class="cd"><div class="num">${item.min}</div><div class="lbl">Min</div></div>
        </div>
      </div>
    </div>
  </article>`;

const renderHome = () => {
  const discoverRail = document.querySelector('[data-render="discover"]');
  if (discoverRail) discoverRail.innerHTML = (data.discover || []).map((item) => createEventCard(item)).join('');

  const topRail = document.querySelector('[data-render="topEvents"]');
  if (topRail) {
    topRail.innerHTML = (data.topEvents || []).map((item) => `
      <article class="card compact-event">
        <div class="media media--gradient media--${item.theme}"></div>
        <div class="body">
          <div class="badge">${item.category}</div>
          <h5>${item.name}</h5>
          <div class="row row--compact">
            <div class="muted">${item.place}</div>
            <a class="pill pill--sm dark" href="./event.html">${item.cta}</a>
          </div>
        </div>
      </article>`).join('');
  }

  const countries = document.querySelector('[data-render="countries"]');
  if (countries) {
    countries.innerHTML = (data.countries || []).map((item, index) => `
      <article class="card city-card">
        <div class="media media--gradient media--country-${(index % 3) + 1}"></div>
        <div class="body">
          <strong>${item.name}</strong>
          <span class="muted">${item.count}</span>
          <a class="pill2" href="./event.html">Explore →</a>
        </div>
      </article>`).join('') + '<div class="browse-inset"><a class="pill" href="./event.html">Browse all 🔍</a></div>';
  }

  const reviews = document.querySelector('[data-render="reviews"]');
  if (reviews) {
    reviews.innerHTML = (data.reviews || []).map((item) => `
      <article class="card testimonial"><div class="body"><h5>${item.name}</h5>${createStars()}<p class="muted">“${item.quote}”</p></div></article>`).join('');
  }

  const stories = document.querySelector('[data-render="stories"]');
  if (stories) {
    stories.innerHTML = (data.stories || []).map((item) => `
      <article class="card story-card">
        <div class="media media--story media--${item.theme}"></div>
        <div class="body">
          <div class="muted">${item.meta}</div>
          <h5>${item.title}</h5>
          <div class="row row--compact"><a class="pill pill--sm dark" href="./README.md">Keep reading</a></div>
        </div>
      </article>`).join('');
  }
};

const renderStats = (selector, items) => {
  const target = document.querySelector(`[data-render="${selector}"]`);
  if (!target) return;
  target.innerHTML = (items || []).map((item) => `
    <article class="card stat-card">
      <div class="body">
        <div class="muted">${item.label}</div>
        <div class="stat-value">${item.value}</div>
        <div class="muted">${item.detail}</div>
      </div>
    </article>`).join('');
};

const renderAttendee = () => {
  renderStats('attendeeStats', data.attendeeStats);
  const nextEvent = document.querySelector('[data-bind="attendee-next-event"]');
  if (nextEvent && data.attendeeTickets?.[0]) nextEvent.textContent = data.attendeeTickets[0].event;
  const unread = document.querySelector('[data-bind="attendee-unread"]');
  if (unread) unread.textContent = data.notifications.filter((item) => item.unread).length;

  const tickets = document.querySelector('[data-render="attendeeTickets"]');
  if (tickets) {
    tickets.innerHTML = (data.attendeeTickets || []).map((item) => `
      <article class="ticket-item">
        <div>
          <strong>${item.event}</strong>
          <div class="muted">${item.ticket} • ${item.date}</div>
        </div>
        <div class="ticket-item__meta">
          <span class="ticket-ref">${item.ref}</span>
          <span class="status-pill">${item.status}</span>
        </div>
      </article>`).join('');
  }

  const saved = document.querySelector('[data-render="savedEvents"]');
  if (saved) {
    saved.innerHTML = (data.savedEvents || []).map((item) => `
      <article class="card saved-card">
        <div class="media media--gradient media--${item.theme}"></div>
        <div class="body">
          <h5>${item.name}</h5>
          <div class="muted">${item.date} • ${item.place}</div>
          <div class="row row--compact"><a class="pill pill--sm dark" href="./event.html">Event page</a></div>
        </div>
      </article>`).join('');
  }

  const notifications = document.querySelector('[data-render="notifications"]');
  if (notifications) {
    notifications.innerHTML = (data.notifications || []).map((item) => `
      <article class="notification-item ${item.unread ? 'unread' : ''}">
        <div class="notification-dot"></div>
        <div>
          <strong>${item.title}</strong>
          <div class="muted">${item.message}</div>
        </div>
        <span class="muted">${item.time}</span>
      </article>`).join('');
  }
};

const renderOrganiser = () => {
  renderStats('organiserStats', data.organiserStats);
  const nextEvent = document.querySelector('[data-bind="organiser-next-event"]');
  if (nextEvent && data.organiserEvents?.[0]) nextEvent.textContent = data.organiserEvents[0].name;
  const attendees = document.querySelector('[data-bind="organiser-attendees"]');
  if (attendees) attendees.textContent = data.organiserStats?.[3]?.value || '';

  const events = document.querySelector('[data-render="organiserEvents"]');
  if (events) {
    events.innerHTML = (data.organiserEvents || []).map((item, index) => `
      <article class="manage-card card">
        <div class="media media--gradient media--${['purple','orange','teal'][index % 3]}"></div>
        <div class="body">
          <h5>${item.name}</h5>
          <div class="muted">${item.date}</div>
          <div class="manage-meta">
            <span class="status-pill">${item.status}</span>
            <span class="muted">${item.sold}</span>
          </div>
          <div class="row row--compact">
            <a class="pill pill--sm dark" href="./event.html">Preview</a>
            <a class="pill pill--sm" href="./attendee.html">Bookings</a>
          </div>
        </div>
      </article>`).join('');
  }

  const bookings = document.querySelector('[data-render="bookings"]');
  if (bookings) {
    bookings.innerHTML = (data.bookings || []).map((item) => `
      <article class="table-row">
        <div>
          <strong>${item.attendee}</strong>
          <div class="muted">${item.event}</div>
        </div>
        <div class="table-meta">
          <strong>${item.amount}</strong>
          <span class="muted">${item.time}</span>
        </div>
      </article>`).join('');
  }

  const payouts = document.querySelector('[data-render="payouts"]');
  if (payouts) {
    payouts.innerHTML = (data.payouts || []).map((item) => `
      <article class="payout-item">
        <span class="muted">${item.title}</span>
        <strong>${item.value}</strong>
      </article>`).join('');
  }
};

const renderEventPage = () => {
  const event = data.eventPage;
  if (!event) return;

  const bindMap = {
    'event-month': event.month,
    'event-day': event.day,
    'event-name': event.name,
    'event-organiser': event.organiser,
    'event-date-time': event.dateTime,
    'event-duration': event.duration,
    'event-location': event.location,
    'event-address': event.address,
    'event-description': event.description,
    'event-category': event.category,
    'event-dress': event.dress,
    'event-age': event.age,
    'event-organiser-copy': event.organiserCopy,
    'event-theme': ''
  };

  Object.entries(bindMap).forEach(([key, value]) => {
    document.querySelectorAll(`[data-bind="${key}"]`).forEach((node) => {
      if (key === 'event-theme') {
        node.classList.add(`media--${event.theme}`);
      } else {
        node.textContent = value;
      }
    });
  });

  const gallery = document.querySelector('[data-render="eventGallery"]');
  if (gallery) {
    gallery.innerHTML = (event.gallery || []).map((theme) => `<div class="additional-image media media--gradient media--${theme}"></div>`).join('');
  }

  const highlights = document.querySelector('[data-render="eventHighlights"]');
  if (highlights) {
    highlights.innerHTML = (event.highlights || []).map((item) => `<li>${item}</li>`).join('');
  }

  const tickets = document.querySelector('[data-render="eventTickets"]');
  if (tickets) {
    tickets.innerHTML = (event.tickets || []).map((item) => `
      <article class="ticket-select-item">
        <div>
          <h4>${item.name}</h4>
          <p class="muted">${item.description}</p>
          <span class="muted">${item.left}</span>
        </div>
        <div class="ticket-select-action">
          <strong>${item.price}</strong>
          <div class="qty-pill">0 1 2</div>
        </div>
      </article>`).join('');
      const count = event.tickets.length;
      const total = event.tickets[0]?.price || '£0.00';
      const itemsNode = document.querySelector('[data-bind="event-summary-items"]');
      const totalNode = document.querySelector('[data-bind="event-summary-total"]');
      if (itemsNode) itemsNode.textContent = `${count} ticket options`;
      if (totalNode) totalNode.textContent = total;
  }

  const related = document.querySelector('[data-render="eventRelated"]');
  if (related) {
    related.innerHTML = (data.discover || []).slice(1).map((item) => createEventCard(item)).join('');
  }
};

const page = document.body.dataset.page;
if (page === 'home') renderHome();
if (page === 'attendee') renderAttendee();
if (page === 'organiser') renderOrganiser();
if (page === 'event') renderEventPage();

setTimeout(() => {
  document.querySelectorAll('.bookmark').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.toggle('is-active');
      const active = button.classList.contains('is-active');
      button.setAttribute('aria-pressed', String(active));
    });
  });
}, 0);
