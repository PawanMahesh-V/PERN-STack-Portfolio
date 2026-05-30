import { useEffect, useState } from 'react';
import { getProjects } from '../../../api/projectsApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../../../components/ui/FadeIn';

export default function ProjectsSection({ section }) {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTag,  setActiveTag]  = useState('All');

  useEffect(() => {
    getProjects(section.id)
      .then(({ data }) => setItems(data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [section.id]);

  const allTags = ['All', ...new Set(items.flatMap(p => p.tech_stack || []))];
  const filtered = activeTag === 'All' ? items : items.filter(p => (p.tech_stack || []).includes(activeTag));

  return (
    <section id="projects" className="section-pad" aria-labelledby="proj-title">
      <div className="container">
        <StaggerContainer delayChildren={0.1}>
          <StaggerItem>
            <span className="section-label">
              <Icon icon="bolt" style={{ marginRight: '0.4rem' }} />What I've built
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 id="proj-title" className="section-title">{section.title}</h2>
          </StaggerItem>
          <StaggerItem>
            <div className="section-divider" />
          </StaggerItem>

          {/* Tech stack filter chips */}
          {!loading && allTags.length > 1 && (
            <StaggerItem>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {allTags.map(tag => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`btn btn-sm interactive ${activeTag === tag ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: 'var(--r-full)' }}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>

        {loading ? <div className="spinner" /> : (
          <motion.div layout className="grid-auto">
            <AnimatePresence>
              {filtered.map((proj) => (
                <motion.article 
                  key={proj.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card interactive"
                  style={styles.card}
                  whileHover={{ y: -8 }}
                >
                  <div style={styles.imgWrap} className="proj-img-wrap">
                    {proj.image_url ? (
                      <img src={proj.image_url} alt={proj.title} style={styles.img} loading="lazy" />
                    ) : (
                      <div style={styles.placeholder}>
                        <Icon icon="folder-open" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', opacity: 0.35 }} />
                      </div>
                    )}
                    <div style={styles.overlay} className="proj-overlay">
                      <div style={styles.overlayInner}>
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm interactive" onClick={e => e.stopPropagation()}>
                            <Icon icon={['fab','github']} style={{ marginRight: '0.35rem' }} />Code
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm interactive" onClick={e => e.stopPropagation()}>
                            <Icon icon="arrow-up-right-from-square" style={{ marginRight: '0.35rem' }} />Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.body}>
                    <h3 style={styles.title}>{proj.title}</h3>
                    {proj.description && <p style={styles.desc}>{proj.description}</p>}
                    {proj.tech_stack?.length > 0 && (
                      <div style={styles.tags}>
                        {proj.tech_stack.map(t => (
                          <span key={t} className="tag interactive" style={{ cursor: 'pointer' }} onClick={() => setActiveTag(t)}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                No projects match "{activeTag}". <button className="btn btn-ghost btn-sm interactive" onClick={() => setActiveTag('All')}>Clear filter</button>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

const styles = {
  card:         { overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  imgWrap:      { position: 'relative', height: '200px', overflow: 'hidden', cursor: 'pointer' },
  img:          { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' },
  placeholder:  { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' },
  overlay:      { position: 'absolute', inset: 0, background: 'rgba(8,8,15,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s ease' },
  overlayInner: { display: 'flex', gap: '0.75rem', transform: 'translateY(8px)', transition: 'transform 0.3s ease' },
  body:         { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 },
  title:        { fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' },
  desc:         { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 },
  tags:         { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' },
};
