import { useEffect, useState, useCallback } from 'react';
import { getMessages, markRead, deleteMessage } from '../../api/contactApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

export default function MessagesPage() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getMessages()
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast('Failed to load messages.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const handleOpen = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      try {
        await markRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch { /* silent */ }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      toast('Message deleted.', 'success');
      if (selected?.id === id) setSelected(null);
      load();
    } catch { toast('Delete failed.', 'error'); }
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={styles.pageTitle}>
          <Icon icon="inbox" style={{ marginRight: '0.5rem' }} />
          Inbox <span className="gradient-text">Messages</span>
          {unread > 0 && (
            <span style={styles.unreadBadge}>{unread} new</span>
          )}
        </h1>
        <p style={styles.pageSub}>Contact form submissions from your portfolio.</p>
      </div>

      <div style={styles.layout}>
        {/* List */}
        <div className="glass-card" style={{ overflow: 'hidden', alignSelf: 'flex-start' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icon icon="inbox" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
              No messages yet.
            </div>
          ) : messages.map((msg, i) => (
            <button
              key={msg.id}
              onClick={() => handleOpen(msg)}
              style={{
                ...styles.msgRow,
                borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                background: selected?.id === msg.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderLeft: !msg.is_read ? '3px solid var(--accent-primary)' : '3px solid transparent',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  {msg.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: msg.is_read ? 500 : 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.name}</p>
                  {!msg.is_read && <Icon icon="circle-dot" style={{ color: 'var(--accent-primary)', fontSize: '0.6rem', flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {msg.message.substring(0, 55)}…
                </p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'var(--font-mono)' }}>
                  <Icon icon="clock" prefix="far" style={{ marginRight: '0.3rem' }} />
                  {new Date(msg.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        {selected ? (
          <div className="glass-card" style={{ padding: '1.75rem', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selected.name}</h2>
                <a href={`mailto:${selected.email}`} style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <Icon icon="envelope" /> {selected.email}
                </a>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Icon icon="clock" prefix="far" /> {new Date(selected.sent_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={`mailto:${selected.email}`} className="btn btn-primary btn-sm">
                  <Icon icon="reply" style={{ marginRight: '0.35rem' }} /> Reply
                </a>
                <button onClick={() => handleDelete(selected.id)} className="btn btn-danger btn-sm btn-icon">
                  <Icon icon="trash" />
                </button>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 0 1.25rem' }} />
            <p style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{selected.message}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', height: '200px', gap: '0.75rem' }}>
            <Icon icon="envelope" style={{ fontSize: '2rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>Select a message to read it</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle:   { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  pageSub:     { color: 'var(--text-muted)', fontSize: '0.9rem' },
  unreadBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(99,102,241,0.2)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.3)' },
  layout:      { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'flex-start' },
  msgRow:      { width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s ease' },
};
