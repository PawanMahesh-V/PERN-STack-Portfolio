import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageKey,    setPageKey]    = useState(location.pathname);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setPageKey(location.pathname);
      setMobileOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast('Logged out successfully.', 'info');
    navigate('/phantom');
  };

  const sidebar = (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ' expanded'}`}>
      {/* Top */}
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Icon icon="rocket" /></div>
          {!collapsed && <span>Admin</span>}
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <Icon icon={collapsed ? 'chevron-right' : 'chevron-left'} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav" aria-label="Admin navigation">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/phantom/dashboard'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            title={collapsed ? item.label : undefined}>
            <span className="sidebar-link-icon"><Icon icon={item.icon} /></span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-avatar"><Icon icon="user" /></div>
            <div className="sidebar-user-info">
              <div className="sidebar-email">{user?.email}</div>
              <div className="sidebar-role">Administrator</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout} aria-label="Logout" title="Logout">
          <Icon icon="arrow-right-from-bracket" />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="admin-root">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ zIndex: 997 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (desktop) */}
      {sidebar}

      {/* Main content */}
      <main className="admin-main">
        {/* Mobile topbar */}
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle sidebar">
            <Icon icon="bars" />
          </button>
          <div className="admin-topbar-title">
            <Icon icon="rocket" /> Admin
          </div>
          <div className="admin-topbar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}>
              <Icon icon="arrow-up-right-from-square" /> Live Site
            </a>
          </div>
        </div>

        {/* Page with enter animation keyed by route */}
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
