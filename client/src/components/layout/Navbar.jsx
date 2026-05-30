import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../../context/ThemeContext';


const NAV_LINKS = [
  { href: '#about',        label: 'About' },
  { href: '#experience',   label: 'Experience' },
  { href: '#projects',     label: 'Projects' },
  { href: '#certificates', label: 'Certificates' },
  { href: '#contact',      label: 'Contact' },
];

export default function Navbar({ settings }) {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cvKey = settings?.cv_key;

  return (
    <>
      <nav
        style={{
          ...styles.nav,
          background: scrolled ? 'rgba(8,8,15,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        }}
        aria-label="Main navigation"
      >
        <div className="container flex-between" style={{ height: '100%' }}>
          {/* Logo */}
          <Link to="/" style={styles.logo} aria-label="Home">
            <Icon icon="rocket" style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }} />
            <span style={styles.logoText} className="gradient-text">Portfolio</span>
          </Link>

          {/* Desktop links */}
          <div style={styles.links} className="hide-mobile">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={styles.link}>{l.label}</a>
            ))}
          </div>

          {/* CV + theme + menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {cvKey && (
              <a
                href={`/api/assets/${cvKey}`}
                download
                className="btn btn-outline btn-sm hide-mobile"
                id="nav-cv-btn"
              >
                <Icon icon="download" /> CV
              </a>
            )}
            <button
              onClick={toggle}
              className="btn btn-ghost btn-icon"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              id="theme-toggle-btn"
              style={{ fontSize: '1rem' }}
            >
              <Icon icon={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="btn btn-ghost btn-icon hide-desktop"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <Icon icon={menuOpen ? 'xmark' : 'bars'} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={styles.drawer} className="glass-card hide-desktop" role="dialog" aria-label="Navigation menu">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} style={styles.drawerLink} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          {cvKey && (
            <a href={`/api/assets/${cvKey}`} download className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Icon icon="download" /> Download CV
            </a>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: '64px',
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  },
  logo:     { display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' },
  logoText: { fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' },
  links:    { display: 'flex', gap: '0.25rem', alignItems: 'center' },
  link: {
    padding: '0.4rem 0.85rem',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
    fontWeight: 500,
    borderRadius: 'var(--r-sm)',
    transition: 'color 0.2s, background 0.2s',
    textDecoration: 'none',
  },
  drawer: {
    position: 'fixed', top: '64px', left: '1rem', right: '1rem', zIndex: 99,
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    animation: 'slideUp 0.25s ease',
  },
  drawerLink: {
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 500,
    borderRadius: 'var(--r-sm)',
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
};
