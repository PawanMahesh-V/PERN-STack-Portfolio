import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

export default function ExperienceSection({ section, resumeData }) {
  const items = resumeData?.experiences || [];

  const containerV = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemV = {
    hidden:  { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55 } },
  };

  return (
    <section id="experience" className="section" aria-labelledby="exp-title">
      <div className="container">
        <div className="section-header">
          <span className="section-label"><Icon icon="clock-rotate-left" /> Career timeline</span>
          <h2 id="exp-title">{section.title}</h2>
          <div className="section-divider" />
        </div>

        <motion.div
          className="experience-timeline"
          variants={containerV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-5%' }}>
          {items.map((exp, i) => (
            <motion.div key={exp.id} className="timeline-item" variants={itemV}>
              {/* Connector */}
              <div className="timeline-connector">
                <div className="timeline-dot">
                  <Icon icon="briefcase" />
                </div>
                {i < items.length - 1 && <div className="timeline-line" />}
              </div>

              {/* Card */}
              <div className="timeline-card">
                <div className="timeline-head">
                  <div>
                    <div className="timeline-role">{exp.role}</div>
                    <div className="timeline-company">
                      {exp.logo_url && <img src={exp.logo_url} alt={exp.company} />}
                      <Icon icon="building" />
                      {exp.company}
                    </div>
                  </div>
                  <span className="timeline-dates">
                    <Icon icon={['far','calendar']} />
                    {exp.start_date
                      ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : '—'}
                    {' – '}
                    {exp.end_date
                      ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : <span className="timeline-present">Present</span>}
                  </span>
                </div>

                {exp.bullets?.length > 0 && (
                  <ul className="timeline-bullets">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="timeline-bullet">
                        <Icon icon="chevron-right" className="timeline-bullet-icon" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
          {items.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No experience entries yet.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
