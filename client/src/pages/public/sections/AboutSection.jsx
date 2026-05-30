import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, useInView } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../../../components/ui/FadeIn';

function CountUp({ target, suffix = '', inView }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) { setValue(target); return; }
    const duration = 1400;
    const step = Math.ceil(duration / end);
    const timer = setInterval(() => {
      start += 1;
      setValue(start);
      if (start >= end) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <>{value}{suffix}</>;
}

export default function AboutSection({ section, settings }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  
  const aboutText = settings?.about_text || section?.content?.text || '';
  const isHtml = aboutText.startsWith('<');

  const STATS = [
    { icon: 'code',        value: 3,   suffix: '+', label: 'Years Experience'      },
    { icon: 'folder-open', value: 10,  suffix: '+', label: 'Projects Built'        },
    { icon: 'certificate', value: 5,   suffix: '+', label: 'Certifications'        },
    { icon: 'handshake',   value: 100, suffix: '%', label: 'Client Satisfaction'   },
  ];

  return (
    <section id="about" className="section-pad" aria-labelledby="about-title" ref={ref}>
      <div className="container">
        <div style={styles.inner}>
          {/* Left — text */}
          <StaggerContainer delayChildren={0.1}>
            <StaggerItem>
              <span className="section-label">
                <Icon icon="user" style={{ marginRight: '0.4rem' }} />Get to know me
              </span>
            </StaggerItem>
            <StaggerItem>
              <h2 id="about-title" className="section-title">{section.title}</h2>
            </StaggerItem>
            <StaggerItem>
              <div className="section-divider" />
            </StaggerItem>

            <StaggerItem>
              {isHtml ? (
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: aboutText }} />
              ) : (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '1.05rem' }}>
                  {aboutText}
                </p>
              )}
            </StaggerItem>
          </StaggerContainer>

          {/* Right — animated stat cards */}
          <StaggerContainer delayChildren={0.3} style={styles.stats}>
            {STATS.map((s, i) => (
              <StaggerItem key={s.label}>
                <motion.div 
                  className="glass-card interactive" 
                  style={styles.statCard}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div style={styles.statIcon}>
                    <Icon icon={s.icon} style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }} />
                  </div>
                  <p style={styles.statValue}>
                    <CountUp target={s.value} suffix={s.suffix} inView={inView} />
                  </p>
                  <p style={styles.statLabel}>{s.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

const styles = {
  inner:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '5rem', alignItems: 'start' },
  stats:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  statCard:  { padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' },
  statIcon:  { width: '48px', height: '48px', borderRadius: 'var(--r-md)', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-mono)' },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
};
