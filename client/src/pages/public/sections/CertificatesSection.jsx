import { useEffect, useState } from 'react';
import { getCertificates } from '../../../api/certificatesApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../../../components/ui/FadeIn';

export default function CertificatesSection({ section }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificates(section.id)
      .then(({ data }) => setItems(data.certificates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [section.id]);

  return (
    <section id="certificates" className="section-pad" aria-labelledby="cert-title">
      <div className="container">
        <StaggerContainer delayChildren={0.1}>
          <StaggerItem>
            <span className="section-label">
              <Icon icon="certificate" style={{ marginRight: '0.4rem' }} />Credentials
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 id="cert-title" className="section-title">{section.title}</h2>
          </StaggerItem>
          <StaggerItem>
            <div className="section-divider" />
          </StaggerItem>

          {loading ? <div className="spinner" /> : (
            <StaggerContainer delayChildren={0.3} className="grid-auto">
              {items.map((cert) => (
                <StaggerItem key={cert.id}>
                  <div
                    className="flip-card interactive"
                    id={`cert-${cert.id}`}
                    title="Hover to see details"
                  >
                    <div className="flip-card-inner">
                      {/* Front */}
                      <div className="flip-front">
                        {cert.image_url ? (
                          <div style={styles.imgWrap}>
                            <img src={cert.image_url} alt={cert.title} style={styles.img} loading="lazy" />
                          </div>
                        ) : (
                          <div style={styles.imgPlaceholder}>
                            <Icon icon="certificate" style={{ fontSize: '3rem', color: 'var(--accent-primary)', opacity: 0.4 }} />
                          </div>
                        )}
                        <div style={styles.frontBody}>
                          <h3 style={styles.title}>{cert.title}</h3>
                          {cert.issuer && (
                            <p style={styles.issuer}>
                              <Icon icon="building" style={{ marginRight: '0.3rem', fontSize: '0.8rem' }} />{cert.issuer}
                            </p>
                          )}
                        </div>
                        <div style={styles.hintBadge}>Hover to flip</div>
                      </div>

                      {/* Back */}
                      <div className="flip-back">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
                          <Icon icon="certificate" style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{cert.title}</h3>
                        {cert.issuer && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{cert.issuer}</p>
                        )}
                        {cert.issue_date && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            <Icon icon="calendar" prefix="far" style={{ marginRight: '0.35rem' }} />
                            {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 700 }}>
                          <Icon icon="circle-check" /> Verified Credential
                        </div>
                        {cert.cert_url && (
                          <a href={cert.cert_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm interactive" style={{ marginTop: '0.5rem' }} onClick={e => e.stopPropagation()}>
                            <Icon icon="arrow-up-right-from-square" style={{ marginRight: '0.35rem' }} />View Credential
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
              {items.length === 0 && <StaggerItem><p style={{ color: 'var(--text-muted)' }}>No certificates yet.</p></StaggerItem>}
            </StaggerContainer>
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}

const styles = {
  imgWrap:      { height: '160px', overflow: 'hidden', background: 'var(--bg-surface)' },
  img:          { width: '100%', height: '100%', objectFit: 'contain', padding: '0.75rem' },
  imgPlaceholder:{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' },
  frontBody:    { padding: '1rem 1.25rem' },
  title:        { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.3rem' },
  issuer:       { fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500, display: 'flex', alignItems: 'center' },
  hintBadge:    { position: 'absolute', bottom: '0.75rem', right: '0.75rem', fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', opacity: 0.6 },
};
