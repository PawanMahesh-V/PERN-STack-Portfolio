import { useState } from 'react';
import { sendMessage } from '../../../api/contactApi';
import { useToast }    from '../../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../../../components/ui/FadeIn';

export default function ContactSection({ section, settings }) {
  const toast = useToast();
  const [form,     setForm]     = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState(''); // spam trap
  const [loading,  setLoading]  = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Honeypot check — bots fill hidden fields
    if (honeypot) return;
    setLoading(true);
    try {
      const { data } = await sendMessage(form);
      toast(data.message, 'success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const dynamicInfo = [
    { icon: 'clock',        label: 'Response time', value: settings?.contact_response_time || 'Within 24 hours' },
    { icon: 'location-dot', label: 'Based in',      value: settings?.contact_location || 'Available worldwide' },
    { icon: 'handshake',    label: 'Open to',       value: settings?.contact_open_to || 'Freelance & Full-time roles' },
  ];

  return (
    <section id="contact" className="section-pad" aria-labelledby="contact-title">
      <div className="container">
        <StaggerContainer delayChildren={0.1} style={styles.inner}>
          {/* Left side */}
          <div style={styles.left}>
            <StaggerItem>
              <span className="section-label">
                <Icon icon="paper-plane" style={{ marginRight: '0.4rem' }} />
                Let's talk
              </span>
            </StaggerItem>
            <StaggerItem>
              <h2 id="contact-title" className="section-title">{section.title}</h2>
            </StaggerItem>
            <StaggerItem>
              <div className="section-divider" />
            </StaggerItem>
            <StaggerItem>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Have a project in mind, a question, or just want to connect? Fill in the form and I'll get back to you promptly.
              </p>
            </StaggerItem>

            <StaggerContainer delayChildren={0.3} style={styles.infoItems}>
              {dynamicInfo.map((item, i) => (
                <StaggerItem key={item.label}>
                  <motion.div 
                    style={styles.infoItem}
                    whileHover={{ x: 10, color: 'var(--accent-primary)' }}
                  >
                    <div style={styles.infoIconWrap}>
                      <Icon icon={item.icon} />
                    </div>
                    <div>
                      <p style={styles.infoLabel}>{item.label}</p>
                      <p style={styles.infoValue}>{item.value}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Form */}
          <StaggerItem>
            <form onSubmit={handleSubmit} className="glass-card" style={styles.form} noValidate>
              {/* Honeypot — hidden from real users, filled by bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
              />
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  <Icon icon="user" style={{ marginRight: '0.4rem' }} /> Your Name
                </label>
                <input id="contact-name" name="name" type="text" className="form-input interactive"
                  placeholder="John Smith" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  <Icon icon="envelope" style={{ marginRight: '0.4rem' }} /> Email Address
                </label>
                <input id="contact-email" name="email" type="email" className="form-input interactive"
                  placeholder="john@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  <Icon icon="pencil" style={{ marginRight: '0.4rem' }} /> Message
                </label>
                <textarea id="contact-message" name="message" className="form-textarea interactive"
                  placeholder="Tell me about your project or inquiry…"
                  rows={5} value={form.message} onChange={handleChange} required />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                id="contact-submit" type="submit" className="btn btn-primary interactive" style={{ width: '100%', gap: '0.5rem' }} disabled={loading}
              >
                {loading
                  ? <><Icon icon="spinner" spin /> Sending…</>
                  : <><Icon icon="paper-plane" /> Send Message</>}
              </motion.button>
            </form>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

const styles = {
  inner:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '5rem', alignItems: 'start' },
  left:        {},
  infoItems:   { marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  infoItem:    { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  infoIconWrap:{ width: '40px', height: '40px', borderRadius: 'var(--r-sm)', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1rem', flexShrink: 0 },
  infoLabel:   { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' },
  infoValue:   { color: 'var(--text-primary)', fontWeight: 500 },
  form:        { padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
};
