import { useState } from 'react';
import { sendMessage } from '../../../api/contactApi';
import { useToast }    from '../../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

export default function ContactSection({ section, settings }) {
  const toast = useToast();
  const [form,     setForm]     = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    { icon: 'location-dot', label: 'Based in',      value: settings?.contact_location      || 'Available worldwide' },
    { icon: 'handshake',    label: 'Open to',       value: settings?.contact_open_to       || 'Freelance & Full-time roles' },
  ];

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-header">
          <span className="section-label"><Icon icon="paper-plane" /> Let's talk</span>
          <h2 id="contact-title">{section.title}</h2>
          <div className="section-divider" />
        </div>

        <div className="contact-grid">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '0.5rem' }}>
              Have a project in mind, a question, or just want to connect? Fill in the form and I'll get back to you promptly.
            </p>
            <div className="contact-info-items">
              {dynamicInfo.map(item => (
                <div key={item.label} className="contact-info-item">
                  <div className="contact-info-icon"><Icon icon={item.icon} /></div>
                  <div>
                    <p className="contact-info-label">{item.label}</p>
                    <p className="contact-info-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}>
            <div className="contact-form-card">
              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  className="honeypot-field"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    <Icon icon="user" /> Your Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="John Smith"
                    value={form.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    <Icon icon="envelope" /> Email Address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">
                    <Icon icon="pencil" /> Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell me about your project or inquiry…"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="form-input"
                    style={{ resize: 'vertical', minHeight: '120px' }}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="contact-submit"
                  id="contact-submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading   ? { scale: 0.98 } : {}}>
                  {loading
                    ? <><Icon icon="spinner" spin /> Sending…</>
                    : <><Icon icon="paper-plane" /> Send Message</>}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
