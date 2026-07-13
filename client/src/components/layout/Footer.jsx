export default function Footer({ settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">
              <span>⬡</span> Portfolio
            </div>
            <p className="footer-sub">{settings?.footer_text || 'Built with React · Node.js · PostgreSQL'}</p>
          </div>
          <p className="footer-copy">© {year} · All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
