import { useEffect, useState } from 'react';
import { getCertificates } from '../../../api/certificatesApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

export default function CertificatesSection({ section }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificates(section.id)
      .then(({ data }) => setItems(data.certificates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [section.id]);

  const containerV = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardV = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section id="certificates" className="section" aria-labelledby="cert-title">
      <div className="container">
        <div className="section-header">
          <span className="section-label"><Icon icon="certificate" /> Credentials</span>
          <h2 id="cert-title">{section.title}</h2>
          <div className="section-divider" />
        </div>

        {loading ? (
          <div className="loader" />
        ) : (
          <motion.div
            className="certs-grid"
            variants={containerV}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}>
            {items.map(cert => (
              <motion.div key={cert.id} variants={cardV}>
                <div className="flip-card" id={`cert-${cert.id}`} title="Hover to see details">
                  <div className="flip-card-inner">
                    {/* Front */}
                    <div className="flip-card-front">
                      <div className="flip-card-front-img">
                        {cert.image_url ? (
                          <img src={cert.image_url} alt={cert.title} loading="lazy" />
                        ) : (
                          <div className="flip-card-front-placeholder">
                            <Icon icon="certificate" />
                          </div>
                        )}
                      </div>
                      <div className="flip-card-front-body">
                        <h3 className="flip-card-front-title">{cert.title}</h3>
                        {cert.issuer && (
                          <p className="flip-card-front-issuer">
                            <Icon icon="building" /> {cert.issuer}
                          </p>
                        )}
                      </div>
                      <div className="flip-card-front-hint">
                        <Icon icon="rotate" /> Hover to flip
                      </div>
                    </div>

                    {/* Back */}
                    <div className="flip-card-back">
                      <div className="flip-card-back-icon">
                        <Icon icon="certificate" />
                      </div>
                      <h3 className="flip-card-back-title">{cert.title}</h3>
                      {cert.issuer && (
                        <p className="flip-card-back-issuer">{cert.issuer}</p>
                      )}
                      {cert.issue_date && (
                        <p className="flip-card-back-date">
                          <Icon icon={['far','calendar']} />
                          {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      <div className="flip-card-back-verified">
                        <Icon icon="circle-check" /> Verified Credential
                      </div>
                      {cert.cert_url && (
                        <a
                          href={cert.cert_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flip-card-back-link"
                          onClick={e => e.stopPropagation()}>
                          <Icon icon="arrow-up-right-from-square" /> View Credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {items.length === 0 && (
              <div className="certs-empty">
                <p style={{ color: 'var(--text-muted)' }}>No certificates yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
