import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSections } from '../../api/sectionsApi';
import { getMessages } from '../../api/contactApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

// ── SVG Sparkline ──────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 200, H = 48;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 6);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '48px', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardHome() {
  const [stats,  setStats]  = useState({ sections: 0, messages: 0, unread: 0 });
  const [views,  setViews]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSections(),
      getMessages(),
      fetch('/api/analytics/views', { headers: { Authorization: `Bearer ${localStorage.getItem('portfolio_token')}` } })
        .then(r => r.ok ? r.json() : { daily: [] }).catch(() => ({ daily: [] })),
    ]).then(([{ data: s }, { data: m }, analytics]) => {
      setStats({ sections: s.sections.length, messages: m.messages.length, unread: m.unread_count });
      setViews(analytics.daily || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const CARDS = [
    { label: 'Live Sections',   value: stats.sections, icon: 'layer-group', to: '/phantom/dashboard/sections',  color: '#6366f1' },
    { label: 'Total Messages',  value: stats.messages, icon: 'inbox',       to: '/phantom/dashboard/messages',  color: '#22d3ee' },
    { label: 'Unread Messages', value: stats.unread,   icon: 'envelope',    to: '/phantom/dashboard/messages',  color: '#f87171' },
    { label: 'Visits (7d)',     value: views.reduce((a,b) => a + b, 0), icon: 'chart-bar', to: '#', color: '#34d399' },
  ];

  const QUICK = [
    { label: 'Edit Site Settings', to: '/phantom/dashboard/settings',     icon: 'gear'        },
    { label: 'Manage Sections',    to: '/phantom/dashboard/sections',     icon: 'layer-group' },
    { label: 'Add a Project',      to: '/phantom/dashboard/projects',     icon: 'folder-open' },
    { label: 'Add Certificate',    to: '/phantom/dashboard/certificates', icon: 'certificate' },
    { label: 'Add Experience',     to: '/phantom/dashboard/experience',   icon: 'briefcase'   },
    { label: 'View Inbox',         to: '/phantom/dashboard/messages',     icon: 'inbox'       },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
        Dashboard <span className="gradient-text">Overview</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
        Manage every piece of your portfolio from here.
      </p>

      {loading ? <div className="spinner" /> : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }} className="admin-content-grid">
            {CARDS.map(c => (
              <Link key={c.label} to={c.to} className="glass-card"
                style={{ padding: '1.5rem', textDecoration: 'none', display: 'block', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-sm)', background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={c.icon} style={{ color: c.color, fontSize: '1.1rem' }} />
                  </div>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: c.color }}>{c.value}</span>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
              </Link>
            ))}
          </div>

          {/* Analytics sparkline */}
          {views.length > 0 && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  <Icon icon="chart-bar" style={{ marginRight: '0.4rem', color: 'var(--accent-primary)' }} />
                  Page Visits — Last 7 Days
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {views.reduce((a,b) => a+b, 0)} total
                </span>
              </div>
              <Sparkline data={views} color="#6366f1" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                {['6d ago','5d ago','4d ago','3d ago','2d ago','Yesterday','Today'].map(d => (
                  <span key={d} style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {QUICK.map(q => (
              <Link key={q.label} to={q.to} className="btn btn-outline"
                style={{ justifyContent: 'flex-start', gap: '0.6rem', fontWeight: 500, padding: '0.7rem 1rem' }}>
                <Icon icon={q.icon} style={{ width: '14px' }} /> {q.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
