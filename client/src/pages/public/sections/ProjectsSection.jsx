import { useEffect, useState, useCallback } from 'react';
import { getProjects } from '../../../api/projectsApi';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

/* ── 3D tilt card ─────────────────────────────────────────── */
function ProjectCard({ proj, setActiveTag }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-75, 75], [10, -10]);
  const rotateY = useTransform(x, [-75, 75], [-10, 10]);

  const handleMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width  / 2);
    y.set(e.clientY - rect.top  - rect.height / 2);
  }, [x, y]);
  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.article
      className="project-card"
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.3 }}
      style={{ rotateX, rotateY, perspective: '800px' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}>

      {/* Image / Placeholder */}
      <div className="project-image-wrap">
        {proj.image_url ? (
          <img src={proj.image_url} alt={proj.title} loading="lazy" />
        ) : (
          <div className="project-placeholder">
            <Icon icon="folder-open" />
          </div>
        )}
        <div className="project-overlay">
          {proj.github_url && (
            <a href={proj.github_url} target="_blank" rel="noopener noreferrer"
               className="project-link project-link-gh" onClick={e => e.stopPropagation()}>
              <Icon icon={['fab','github']} /> Code
            </a>
          )}
          {proj.live_url && (
            <a href={proj.live_url} target="_blank" rel="noopener noreferrer"
               className="project-link project-link-live" onClick={e => e.stopPropagation()}>
              <Icon icon="arrow-up-right-from-square" /> Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="project-body">
        <h3 className="project-title">{proj.title}</h3>
        {proj.description && <p className="project-desc">{proj.description}</p>}
        {proj.tech_stack?.length > 0 && (
          <div className="project-tags">
            {proj.tech_stack.map(t => (
              <span key={t} className="tag" onClick={() => setActiveTag(t)}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default function ProjectsSection({ section }) {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    getProjects(section.id)
      .then(({ data }) => setItems(data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [section.id]);

  const allTags  = ['All', ...new Set(items.flatMap(p => p.tech_stack || []))];
  const filtered = activeTag === 'All' ? items : items.filter(p => (p.tech_stack || []).includes(activeTag));

  return (
    <section id="projects" className="section" aria-labelledby="proj-title">
      <div className="container">
        <div className="section-header">
          <span className="section-label"><Icon icon="rocket" /> What I've built</span>
          <h2 id="proj-title">{section.title}</h2>
          <div className="section-divider" />
        </div>

        {/* Filter chips */}
        {!loading && allTags.length > 1 && (
          <div className="projects-filters">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag${activeTag === tag ? ' active' : ''}`}
                onClick={() => setActiveTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loader" />
        ) : (
          <motion.div className="projects-grid" layout>
            <AnimatePresence mode="popLayout">
              {filtered.map(proj => (
                <ProjectCard key={proj.id} proj={proj} setActiveTag={setActiveTag} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="projects-empty">
                <p>No projects match "{activeTag}". </p>
                <button onClick={() => setActiveTag('All')}>Clear filter</button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
