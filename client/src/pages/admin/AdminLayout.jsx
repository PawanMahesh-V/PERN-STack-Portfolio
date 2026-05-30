import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

const NAV = [
  { to: '/phantom/dashboard',              label: 'Overview',      icon: 'house'       },
  { to: '/phantom/dashboard/settings',     label: 'Site Settings', icon: 'gear'        },
  { to: '/phantom/dashboard/sections',     label: 'Sections',      icon: 'layer-group' },
  { to: '/phantom/dashboard/projects',     label: 'Projects',      icon: 'folder-open' },
  { to: '/phantom/dashboard/certificates', label: 'Certificates',  icon: 'certificate' },
  { to: '/phantom/dashboard/experience',   label: 'Experience',    icon: 'briefcase'   },
  { to: '/phantom/dashboard/skills',       label: 'Skills',        icon: 'bolt'        },
  { to: '/phantom/dashboard/messages',     label: 'Messages',      icon: 'inbox'       },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [pageKey,     setPageKey]     = useState(location.pathname);
  const prevPath = useRef(location.pathname);

  // Page transition key — updates on route change
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setPageKey(location.pathname);
      setMobileOpen(false); // close sidebar on mobile nav
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast('Logged out successfully.', 'info');
    navigate('/phantom');
  };

  const sidebar = (
    <aside
      className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}
      style={{ ...styles.sidebar, width: collapsed ? '64px' : '240px' }}
    >
      {/* Logo */}
      <div style={styles.sidebarTop}>
        {!collapsed && (
          <span style={styles.sidebarLogo} className="gradient-text">
            <Icon icon="rocket" style={{ marginRight: '0.5rem' }} />Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="btn btn-ghost btn-icon"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ marginLeft: 'auto' }}
        >
          <Icon icon={collapsed ? 'chevron-right' : 'chevron-left'} />
        </button>
      </div>

      {/* Nav links */}
      <nav style={styles.sidebarNav} aria-label="Admin navigation">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/phantom/dashboard'}
            style={({ isActive }) => ({
              ...styles.navLink,
              background:  isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color:       isActive ? 'var(--accent-primary)'  : 'var(--text-secondary)',
              borderLeft:  isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
            })}
            title={collapsed ? item.label : undefined}
          >
            <Icon icon={item.icon} style={{ ...styles.navIcon, color: 'inherit' }} />
            {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={styles.sidebarBottom}>
        {!collapsed && (
          <div style={styles.userBlock}>
            <div style={styles.userAvatar}>
              <Icon icon="user" style={{ fontSize: '0.75rem', color: '#fff' }} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Administrator</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-icon" aria-label="Logout" title="Logout">
          <Icon icon="arrow-right" />
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {sidebar}

      {/* ── Main content ── */}
      <main className="admin-main" style={styles.main}>
        {/* Mobile topbar */}
        <div style={styles.mobileTopbar}>
          <button
            className="btn btn-ghost btn-icon admin-topbar-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle sidebar"
            style={{ display: 'none' }} // shown by CSS media query
          >
            <Icon icon="bars" />
          </button>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1rem' }}>
            <Icon icon="rocket" style={{ marginRight: '0.5rem' }} />Admin
          </span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title="View live site">
            <Icon icon="arrow-up-right-from-square" style={{ marginRight: '0.35rem' }} />
            <span className="hide-mobile">Live Site</span>
          </a>
        </div>

        {/* Page with enter animation keyed by route */}
        <div key={pageKey} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  sidebar: {
    flexShrink: 0,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex', flexDirection: 'column',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    position: 'sticky', top: 0, height: '100vh',
  },
  sidebarTop: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '1.25rem 1rem',
    borderBottom: '1px solid var(--border-subtle)',
    minHeight: '64px',
  },
  sidebarLogo:  { fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
  sidebarNav:   { flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', overflowY: 'auto' },
  navLink: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.6rem 0.75rem',
    borderRadius: 'var(--r-sm)',
    fontWeight: 500, fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'all var(--t-base)',
    whiteSpace: 'nowrap',
  },
  navIcon:  { width: '16px', textAlign: 'center', flexShrink: 0 },
  navLabel: {},
  sidebarBottom: {
    padding: '1rem 0.75rem',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  userBlock:  { display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, overflow: 'hidden' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  main:       { flex: 1, padding: '2.5rem', overflow: 'auto', minWidth: 0 },
  mobileTopbar: {
    display: 'none', // shown by CSS @media for mobile
    alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--r-lg)',
    border: '1px solid var(--border-subtle)',
  },
};
