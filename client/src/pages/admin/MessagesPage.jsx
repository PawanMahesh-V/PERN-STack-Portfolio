import { useEffect, useState, useCallback } from 'react';
import { getMessages, markRead, deleteMessage } from '../../api/contactApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">
            Inbox <span>Messages</span>
            {unread > 0 && <span className="ap-badge ap-badge-blue" style={{ fontSize: '0.7rem' }}>{unread} new</span>}
          </h1>
          <p className="ap-sub">Contact form submissions from your portfolio.</p>
        </div>
      </div>

      {loading ? <div className="loader" /> : (
        <div className="messages-layout">
          {/* List */}
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="messages-empty-list">
                <Icon icon="inbox" style={{ fontSize: '2rem', opacity: 0.3 }} />
                <p>No messages yet.</p>
              </div>
            ) : messages.map(msg => (
              <button
                key={msg.id}
                className={`msg-row${selected?.id === msg.id ? ' selected' : ''}`}
                onClick={() => handleOpen(msg)}>
                <div className="msg-avatar">{msg.name?.[0]?.toUpperCase()}</div>
                <div className="msg-row-info">
                  <div className="msg-row-top">
                    <span className="msg-row-name">{msg.name}</span>
                    {!msg.is_read && <Icon icon="circle-dot" className="msg-row-unread" />}
                  </div>
                  <p className="msg-row-preview">{msg.message.substring(0, 55)}…</p>
                  <p className="msg-row-date">
                    {new Date(msg.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Detail pane */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                className="msg-detail"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}>
                <div className="msg-detail-header">
                  <div>
                    <div className="msg-detail-name">{selected.name}</div>
                    <a href={`mailto:${selected.email}`} className="msg-detail-email">
                      <Icon icon="envelope" /> {selected.email}
                    </a>
                    <div className="msg-detail-date">
                      <Icon icon={['far','clock']} />
                      {new Date(selected.sent_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="msg-detail-actions">
                    <a href={`mailto:${selected.email}`} className="btn-admin-secondary">
                      <Icon icon="reply" /> Reply
                    </a>
                    <button className="btn-admin-danger" onClick={() => handleDelete(selected.id)}>
                      <Icon icon="trash" />
                    </button>
                  </div>
                </div>
                <div className="msg-detail-body">{selected.message}</div>
              </motion.div>
            ) : (
              <div className="msg-detail-placeholder">
                <Icon icon="envelope" />
                <p>Select a message to read it</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
