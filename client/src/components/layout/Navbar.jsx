import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '#about',        label: 'About' },
  { href: '#experience',   label: 'Experience' },
  { href: '#projects',     label: 'Projects' },
  { href: '#certificates', label: 'Certificates' },
  { href: '#contact',      label: 'Contact' },
];

export default function Navbar({ settings }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const cvKey = settings?.cv_key;

  return (
    <>
      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="Home">
            <span className="navbar-logo-icon"><Icon icon="rocket" /></span>
            <span>Portfolio</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-links">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="navbar-link">{l.label}</a>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {cvKey && (
              <a href={`/api/assets/${cvKey}`} download className="navbar-cv" id="nav-cv-btn">
                <Icon icon="download" /> CV
              </a>
            )}
            <button
              className="navbar-menu-btn"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}>
              <Icon icon={menuOpen ? 'xmark' : 'bars'} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`} role="dialog" aria-label="Navigation menu">
        <button
          className="navbar-menu-btn"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex' }}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu">
          <Icon icon="xmark" />
        </button>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        {cvKey && (
          <a href={`/api/assets/${cvKey}`} download className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <Icon icon="download" /> Download CV
          </a>
        )}
      </div>
    </>
  );
}
