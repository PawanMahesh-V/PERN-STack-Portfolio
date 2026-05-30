import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../../../components/ui/FadeIn';

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
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{level}%</span>
      </div>
      <div className="skill-bar-track">
        <motion.div 
          className="skill-bar-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.2, delay, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>
    </div>
  );
}

export default function SkillsSection({ section }) {
  const content    = section.content || {};
  const categories = content.categories || [];

  return (
    <section id="skills" className="section-pad" aria-labelledby="skills-title">
      <div className="container">
        <StaggerContainer delayChildren={0.1}>
          <StaggerItem>
            <span className="section-label">
              <Icon icon="bolt" style={{ marginRight: '0.4rem' }} />Tech stack
            </span>
          </StaggerItem>
          <StaggerItem>
            <h2 id="skills-title" className="section-title">{section.title}</h2>
          </StaggerItem>
          <StaggerItem>
            <div className="section-divider" />
          </StaggerItem>

          {categories.length === 0 ? (
            <StaggerItem>
              <p style={{ color: 'var(--text-muted)' }}>No skills added yet. Edit this section in the admin panel.</p>
            </StaggerItem>
          ) : (
            <StaggerContainer delayChildren={0.3} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {categories.map((cat, ci) => (
                <StaggerItem key={cat.name}>
                  <motion.div 
                    className="glass-card interactive" 
                    style={{ padding: '1.5rem' }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent-primary)' }}>
                      <Icon icon={CATEGORY_ICONS[cat.name] || 'star'} />
                      {cat.name}
                    </h3>
                    {(cat.skills || []).map((skill, si) => (
                      <SkillBar
                        key={skill.name}
                        name={skill.name}
                        level={skill.level}
                        delay={0.1 + (si * 0.1)}
                      />
                    ))}
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}
