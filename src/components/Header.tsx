import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#demo', label: 'Demo' },
  { href: '#products', label: 'Products' },
  { href: '#apps', label: 'Apps' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onResize = () => window.innerWidth > 860 && setOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header className={`site-header ${scrolled || open ? 'is-solid' : ''}`}>
      <div className="shell header-inner">
        <a className="brand" href="#top" aria-label="ShowRave home">
          <img src={`${import.meta.env.BASE_URL}assets/main-app-icon.png`} alt="" width="34" height="34" />
          <span>ShowRave</span>
        </a>
        <nav className="header-nav" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <a className="btn btn--ghost header-cta" href="https://showrave.com" target="_blank" rel="noreferrer">
          Visit ShowRave
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span />
        </button>
      </div>
      {open && (
        <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <a href="https://showrave.com" target="_blank" rel="noreferrer">Visit ShowRave</a>
        </nav>
      )}
    </header>
  );
}
