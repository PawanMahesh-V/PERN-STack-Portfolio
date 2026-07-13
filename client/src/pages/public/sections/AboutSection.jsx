import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, useInView } from 'framer-motion';

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

/* ── 3D tilt on stat cards ────────────────────────────────── */
function StatCard({ icon, value, suffix, label, inView, delay }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    setTilt({ x: -(y / (rect.height / 2)) * 10, y: (x / (rect.width / 2)) * 10 });
  };
  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}>
      <div className="stat-icon">
        <Icon icon={icon} />
      </div>
      <p className="stat-value">
        <CountUp target={value} suffix={suffix} inView={inView} />
      </p>
      <p className="stat-label">{label}</p>
    </motion.div>
  );
}

export default function AboutSection({ section, settings }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const aboutText = settings?.about_text || section?.content?.text || '';
  const isHtml    = aboutText.startsWith('<');

  const STATS = [
    { icon: 'code',        value: 3,   suffix: '+', label: 'Years Experience'    },
    { icon: 'folder-open', value: 10,  suffix: '+', label: 'Projects Built'      },
    { icon: 'certificate', value: 5,   suffix: '+', label: 'Certifications'      },
    { icon: 'handshake',   value: 100, suffix: '%', label: 'Client Satisfaction' },
  ];

  return (
    <section id="about" className="section" aria-labelledby="about-title" ref={ref}>
      <div className="container">
        <div className="about-grid">
          {/* Left — text */}
          <motion.div
            className="about-text-content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>

            <div className="section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
              <span className="section-label">
                <Icon icon="user" /> Get to know me
              </span>
              <h2 id="about-title" style={{ marginTop: '1rem' }}>{section.title}</h2>
              <div className="section-divider" style={{ marginLeft: 0 }} />
            </div>

            <div className="about-prose">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: aboutText }} />
              ) : (
                <p>{aboutText}</p>
              )}
            </div>
          </motion.div>

          {/* Right — stat cards */}
          <div className="stat-grid">
            {STATS.map((s, i) => (
              <StatCard key={s.label} {...s} inView={inView} delay={0.1 + i * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
