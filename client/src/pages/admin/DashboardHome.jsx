import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSections } from '../../api/sectionsApi';
import { getMessages } from '../../api/contactApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

function Sparkline({ data, color = '#ffffff' }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 400, H = 64;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 8);
    return `${x},${y}`;
  }).join(' ');
  const areaFirst = `0,${H} ${pts} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dash-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon points={areaFirst} fill="url(#sparkGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardHome() {
  const [stats,   setStats]   = useState({ sections: 0, messages: 0, unread: 0 });
  const [views,   setViews]   = useState([]);
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
    { label: 'Live Sections',   value: stats.sections, icon: 'layer-group', to: '/phantom/dashboard/sections'  },
    { label: 'Total Messages',  value: stats.messages, icon: 'inbox',       to: '/phantom/dashboard/messages'  },
    { label: 'Unread Messages', value: stats.unread,   icon: 'envelope',    to: '/phantom/dashboard/messages'  },
    { label: 'Visits (7d)',     value: views.reduce((a,b) => a + b, 0), icon: 'chart-bar', to: '#' },
  ];

  const QUICK = [
    { label: 'Edit Site Settings', to: '/phantom/dashboard/settings',     icon: 'gear'        },
    { label: 'Manage Sections',    to: '/phantom/dashboard/sections',     icon: 'layer-group' },
    { label: 'Add a Project',      to: '/phantom/dashboard/projects',     icon: 'folder-open' },
    { label: 'Add Certificate',    to: '/phantom/dashboard/certificates', icon: 'certificate' },
    { label: 'Add Experience',     to: '/phantom/dashboard/experience',   icon: 'briefcase'   },
    { label: 'View Inbox',         to: '/phantom/dashboard/messages',     icon: 'inbox'       },
  ];

  const cardV = {
    hidden:  { opacity: 0, y: 20 },
    visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  };

  return (
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Dashboard <span>Overview</span></h1>
          <p className="ap-sub">Manage every piece of your portfolio from here.</p>
        </div>
      </div>

      {loading ? (
        <div className="loader" />
      ) : (
        <>
          {/* Stats */}
          <div className="dash-stats">
            {CARDS.map((c, i) => (
              <motion.div
                key={c.label}
                custom={i}
                variants={cardV}
                initial="hidden"
                animate="visible">
                <Link to={c.to} className="dash-stat-card">
                  <div className="dash-stat-top">
                    <div className="dash-stat-icon"><Icon icon={c.icon} /></div>
                  </div>
                  <div className="dash-stat-value">{c.value}</div>
                  <div className="dash-stat-label">{c.label}</div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Analytics chart */}
          {views.length > 0 && (
            <div className="dash-chart-card">
              <div className="dash-chart-head">
                <div className="dash-chart-title">
                  <Icon icon="chart-bar" /> Page Visits — Last 7 Days
                </div>
                <span className="dash-chart-total">
                  {views.reduce((a,b) => a+b, 0)} total
                </span>
              </div>
              <Sparkline data={views} color="#ffffff" />
              <div className="dash-chart-labels">
                {['6d ago','5d ago','4d ago','3d ago','2d ago','Yesterday','Today'].map(d => (
                  <span key={d} className="dash-chart-label">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="dash-quick-title">Quick Actions</div>
          <div className="dash-quick-grid">
            {QUICK.map(q => (
              <Link key={q.label} to={q.to} className="dash-quick-link">
                <div className="dash-quick-link-icon"><Icon icon={q.icon} /></div>
                {q.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
