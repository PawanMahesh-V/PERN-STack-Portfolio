import { useEffect, useState } from 'react';
import { getExperiences } from '../../../api/experiencesApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../../../components/ui/FadeIn';

export default function ExperienceSection({ section }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiences(section.id)
      .then(({ data }) => setItems(data.experiences))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [section.id]);

  return (
    <section id="experience" className="section-pad" aria-labelledby="exp-title">
      <div className="container">
        <StaggerContainer delayChildren={0.1}>
          <StaggerItem>
            <span className="section-label">
              <Icon icon="clock-rotate-left" style={{ marginRight: '0.4rem' }} />Career timeline
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 id="exp-title" className="section-title">{section.title}</h2>
          </StaggerItem>
          <StaggerItem>
            <div className="section-divider" />
          </StaggerItem>

          {loading ? <div className="spinner" /> : (
            <StaggerContainer delayChildren={0.3} style={styles.timeline}>
              {items.map((exp, i) => (
                <StaggerItem key={exp.id}>
                  <div style={styles.item}>
                    <div style={styles.connectorWrap}>
                      <div style={styles.dot}><Icon icon="briefcase" style={{ fontSize: '0.55rem', color: '#fff' }} /></div>
                      {i < items.length - 1 && <div style={styles.line} />}
                    </div>
                    <motion.div 
                      className="glass-card interactive" 
                      style={styles.card}
                      whileHover={{ scale: 1.01, x: 5 }}
                    >
                      <div style={styles.cardHead}>
                        <div>
                          <h3 style={styles.role}>{exp.role}</h3>
                          <p style={styles.company}>
                            {exp.logo_url && <img src={exp.logo_url} alt={exp.company} style={styles.logo} />}
                            <Icon icon="building" style={{ marginRight: '0.4rem', fontSize: '0.85rem' }} />{exp.company}
                          </p>
                        </div>
                        <span style={styles.dates}>
                          <Icon icon={['far','calendar']} style={{ marginRight: '0.35rem' }} />
                          {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—'}
                          {' – '}
                          {exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : <span style={{color:'var(--accent-secondary)'}}>Present</span>}
                        </span>
                      </div>
                      {exp.bullets?.length > 0 && (
                        <ul style={styles.bullets}>
                          {exp.bullets.map((b, bi) => (
                            <li key={bi} style={styles.bullet}>
                              <Icon icon="chevron-right" style={styles.bulletIcon} />{b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  </div>
                </StaggerItem>
              ))}
              {items.length === 0 && <StaggerItem><p style={{ color: 'var(--text-muted)' }}>No experience entries yet.</p></StaggerItem>}
            </StaggerContainer>
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}

const styles = {
  timeline:      { display: 'flex', flexDirection: 'column', gap: '0' },
  item:          { display: 'flex', gap: '1.5rem', paddingBottom: '2rem' },
  connectorWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.35rem', flexShrink: 0 },
  dot:           { width: '26px', height: '26px', borderRadius: '50%', background: 'var(--gradient-brand)', boxShadow: '0 0 12px rgba(244,63,94,0.5)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  line:          { width: '2px', flex: 1, background: 'linear-gradient(to bottom, rgba(244,63,94,0.4), transparent)', marginTop: '6px' },
  card:          { flex: 1, padding: '1.5rem' },
  cardHead:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
  role:          { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' },
  company:       { display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 500 },
  logo:          { width: '18px', height: '18px', objectFit: 'contain', borderRadius: '4px', marginRight: '0.4rem' },
  dates:         { fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center' },
  bullets:       { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  bullet:        { display: 'flex', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, alignItems: 'flex-start' },
  bulletIcon:    { color: 'var(--accent-secondary)', flexShrink: 0, marginTop: '4px', fontSize: '0.7rem' },
};
