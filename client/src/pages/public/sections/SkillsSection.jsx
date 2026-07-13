import { useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, useInView } from 'framer-motion';

const CATEGORY_ICONS = {
  Frontend:  ['fab','react'],
  Backend:   'server',
  Database:  'database',
  Tools:     'sliders',
  Languages: 'code',
  Cloud:     'cloud',
  Other:     'star',
};

function SkillBar({ name, level, delay = 0 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <div className="skill-item" ref={ref}>
      <div className="skill-meta">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{level}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{ width: inView ? `${level}%` : '0%', transitionDelay: `${delay}s` }}
        />
      </div>
    </div>
  );
}

export default function SkillsSection({ section }) {
  const content    = section.content || {};
  const categories = content.categories || [];

  const containerV = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const cardV = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <div className="section-header">
          <span className="section-label"><Icon icon="bolt" /> Tech stack</span>
          <h2 id="skills-title">{section.title}</h2>
          <div className="section-divider" />
        </div>

        {categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            No skills added yet. Edit this section in the admin panel.
          </p>
        ) : (
          <motion.div
            className="skills-grid"
            variants={containerV}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}>
            {categories.map((cat, ci) => (
              <motion.div key={cat.name} className="skill-category-card" variants={cardV}>
                <div className="skill-category-header">
                  <div className="skill-category-icon">
                    <Icon icon={CATEGORY_ICONS[cat.name] || 'star'} />
                  </div>
                  <h3 className="skill-category-name">{cat.name}</h3>
                </div>
                <div className="skill-list">
                  {(cat.skills || []).map((skill, si) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      delay={0.05 + si * 0.08}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
