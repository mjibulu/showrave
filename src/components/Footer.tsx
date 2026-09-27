export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-cta">
          <h2>Host your next event on ShowRave.</h2>
          <a className="btn btn--primary btn--lg" href="https://showrave.com" target="_blank" rel="noreferrer">Create event</a>
        </div>
        <div className="footer-bottom">
          <a className="brand" href="#top" aria-label="ShowRave home">
            <img src={`${import.meta.env.BASE_URL}assets/main-app-icon.png`} alt="" width="30" height="30" />
            <span>ShowRave</span>
          </a>
          <nav className="footer-links" aria-label="Footer">
            <a href="https://showrave.com" target="_blank" rel="noreferrer">Website</a>
            <a href="https://dp.showrave.com" target="_blank" rel="noreferrer">DP Studio</a>
            <a href="https://showrave.com/apps" target="_blank" rel="noreferrer">Apps</a>
            <a href="https://showrave.com/contact" target="_blank" rel="noreferrer">Contact</a>
          </nav>
          <small>© {new Date().getFullYear()} ShowRave</small>
        </div>
      </div>
    </footer>
  );
}
