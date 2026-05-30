import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmt = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const duration = (start, end) => {
  const s = start ? new Date(start) : null;
  const e = end   ? new Date(end)   : new Date();
  if (!s) return '';
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}mo`].filter(Boolean).join(' ');
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

/* ─── Section wrapper ──────────────────────────────────────────── */
function ResumeSection({ title, icon, children }) {
  return (
    <section style={sec.wrap}>
      <div style={sec.header}>
        <Icon icon={icon} style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }} />
        <h2 style={sec.title}>{title}</h2>
      </div>
      <div style={sec.rule} />
      {children}
    </section>
  );
}

const sec = {
  wrap:   { marginBottom: '1.5rem', breakInside: 'avoid' },
  header: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' },
  title:  { fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#1e1b4b', margin: 0 },
  rule:   { height: '2px', background: 'linear-gradient(to right,#4f46e5,#06b6d4)', borderRadius: '2px', marginBottom: '0.9rem' },
};

/* ─── Main Component ───────────────────────────────────────────── */
export default function ResumePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetch('/api/resume/data')
      .then(r => r.json())
      .then(data => {
        setData(data);
        if (data?.settings?.seo_title) {
          document.title = data.settings.seo_title + ' - Resume';
        }
      })
      .catch(() => setError('Failed to load resume data.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
      <a href="/" className="btn btn-outline">← Back to Portfolio</a>
    </div>
  );

  const { settings = {}, experiences = [], projects = [], certificates = [], sections = [] } = data || {};
  const name       = settings.hero_title  || 'My Name';
  const aboutRaw   = settings.about_text  || '';
  const aboutText  = stripHtml(aboutRaw);
  const github     = settings.social_github   || '';
  const linkedin   = settings.social_linkedin || '';
  const twitter    = settings.social_twitter  || '';
  const email      = settings.contact_email   || '';

  // Extract skills from a skills-type section's content
  const skillsSection = sections.find(s => s.type === 'skills');
  const skillCategories = skillsSection?.content?.categories || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
    >
      {/* ── Print controls (hidden when printing) ── */}
      <div className="resume-controls no-print">
        <div style={ctrl.bar}>
          <a href="/" style={ctrl.back}>
            <Icon icon="arrow-left" style={{ marginRight: '0.4rem' }} />Back to Portfolio
          </a>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={ctrl.hint}>
              <Icon icon="circle-info" style={{ marginRight: '0.4rem', color: '#6366f1' }} />
              Choose "Save as PDF" in the print dialog
            </span>
            <button onClick={handlePrint} style={ctrl.btn} id="download-resume-btn">
              <Icon icon="file-pdf" style={{ marginRight: '0.5rem' }} />Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Resume Paper ── */}
      <div style={paper.page} ref={printRef} id="resume-paper">

        {/* HEADER */}
        <header style={paper.header}>
          <div>
            <h1 style={paper.name}>{name}</h1>
            <p style={paper.subtitle}>{settings?.resume_subtitle || 'Full-Stack Developer · PERN Stack'}</p>
          </div>

          {/* Contact row */}
          <div style={paper.contacts}>
            {email && (
              <span style={paper.contact}>
                <Icon icon="envelope" style={{ color: '#4f46e5', marginRight: '0.3rem' }} />{email}
              </span>
            )}
            {github && (
              <a href={github} style={paper.contact}>
                <Icon icon={['fab','github']} style={{ color: '#4f46e5', marginRight: '0.3rem' }} />
                {github.replace(/https?:\/\/(www\.)?github\.com\//,'github.com/')}
              </a>
            )}
            {linkedin && (
              <a href={linkedin} style={paper.contact}>
                <Icon icon={['fab','linkedin']} style={{ color: '#4f46e5', marginRight: '0.3rem' }} />
                {linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//,'linkedin/in/')}
              </a>
            )}
            {twitter && (
              <a href={twitter} style={paper.contact}>
                <Icon icon={['fab','twitter']} style={{ color: '#4f46e5', marginRight: '0.3rem' }} />
                {twitter.replace(/https?:\/\/(www\.)?twitter\.com\//,'@')}
              </a>
            )}
          </div>
        </header>

        {/* Two-column layout */}
        <div style={paper.body}>

          {/* ── LEFT COLUMN (wide) ── */}
          <div style={paper.left}>

            {/* Summary */}
            {aboutText && (
              <ResumeSection title="Professional Summary" icon="user">
                <p style={text.body}>{aboutText.slice(0, 500)}{aboutText.length > 500 ? '…' : ''}</p>
              </ResumeSection>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <ResumeSection title="Work Experience" icon="briefcase">
                {experiences.map((exp, i) => (
                  <div key={exp.id} style={{ marginBottom: i < experiences.length - 1 ? '1.1rem' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={text.jobTitle}>{exp.role}</h3>
                        <p style={text.company}>
                          <Icon icon="building" style={{ marginRight: '0.3rem', fontSize: '0.7rem' }} />{exp.company}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                        <p style={text.date}>{fmt(exp.start_date)} – {exp.end_date ? fmt(exp.end_date) : 'Present'}</p>
                        {exp.start_date && <p style={{ ...text.date, color: '#6366f1', fontWeight: 600 }}>{duration(exp.start_date, exp.end_date)}</p>}
                      </div>
                    </div>
                    {exp.bullets?.length > 0 && (
                      <ul style={text.bullets}>
                        {exp.bullets.map((b, bi) => <li key={bi} style={text.bullet}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </ResumeSection>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <ResumeSection title="Projects" icon="folder-open">
                {projects.slice(0, 5).map((proj, i) => (
                  <div key={proj.id} style={{ marginBottom: i < Math.min(projects.length,5) - 1 ? '0.9rem' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={text.jobTitle}>{proj.title}</h3>
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                        {proj.github_url && <a href={proj.github_url} style={text.link}>GitHub</a>}
                        {proj.live_url   && <a href={proj.live_url}   style={text.link}>Live</a>}
                      </div>
                    </div>
                    {proj.description && <p style={text.body}>{proj.description}</p>}
                    {proj.tech_stack?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                        {proj.tech_stack.map(t => (
                          <span key={t} style={chip}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ResumeSection>
            )}
          </div>

          {/* ── RIGHT COLUMN (narrow) ── */}
          <div style={paper.right}>

            {/* Skills */}
            {skillCategories.length > 0 && (
              <ResumeSection title="Skills" icon="code">
                {skillCategories.map(cat => (
                  <div key={cat.name} style={{ marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{cat.name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {cat.skills?.map(sk => (
                        <span key={sk.name} style={chip}>{sk.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </ResumeSection>
            )}

            {/* Certificates */}
            {certificates.length > 0 && (
              <ResumeSection title="Certifications" icon="certificate">
                {certificates.map(cert => (
                  <div key={cert.id} style={{ marginBottom: '0.65rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e1b4b', lineHeight: 1.3, margin: '0 0 0.1rem' }}>{cert.title}</p>
                    <p style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 500, margin: '0 0 0.05rem' }}>{cert.issuer}</p>
                    {cert.issue_date && <p style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', margin: 0 }}>{fmt(cert.issue_date)}</p>}
                  </div>
                ))}
              </ResumeSection>
            )}

            {/* Education */}
            <ResumeSection title="Education" icon="graduation-cap">
              <div style={{ marginBottom: '0.65rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e1b4b', lineHeight: 1.3, margin: '0 0 0.1rem' }}>
                  {settings?.resume_education_degree || 'Bachelor of Science, Computing'}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 500, margin: '0 0 0.05rem' }}>
                  {settings?.resume_education_institution || 'SZABIST University'}
                </p>
                <p style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', margin: 0 }}>
                  {settings?.resume_education_year || '2020 – 2024'}
                </p>
              </div>
            </ResumeSection>

            {/* Languages */}
            <ResumeSection title="Languages" icon="globe">
              {(settings?.resume_languages 
                ? settings.resume_languages.split(',').map(l => l.trim()).filter(Boolean)
                : ['English (Professional)', 'Urdu (Native)']
              ).map(l => (
                <p key={l} style={{ fontSize: '0.78rem', color: '#374151', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Icon icon="check" style={{ color: '#4f46e5', fontSize: '0.65rem' }} />{l}
                </p>
              ))}
            </ResumeSection>
          </div>
        </div>

        {/* Footer */}
        <footer style={paper.footer}>
          <p>Generated from live portfolio data · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </footer>
      </div>
    </motion.div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const ctrl = {
  bar:  { maxWidth: '900px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' },
  back: { fontSize: '0.875rem', color: '#4f46e5', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 600 },
  hint: { fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center' },
  btn:  { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(79,70,229,0.35)', transition: 'opacity 0.2s' },
};

const paper = {
  page:   { maxWidth: '900px', margin: '0 auto 3rem', background: '#fff', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: '#1f2937' },
  header: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e40af 100%)', padding: '2rem 2.5rem', color: '#fff' },
  name:   { fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.2rem', color: '#fff' },
  subtitle:{ fontSize: '0.9rem', color: '#c7d2fe', fontWeight: 500, margin: '0 0 1rem' },
  contacts:{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', marginTop: '0.75rem' },
  contact: { fontSize: '0.78rem', color: '#e0e7ff', textDecoration: 'none', display: 'flex', alignItems: 'center' },
  body:   { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0 },
  left:   { padding: '1.75rem 2rem 1.75rem 2.5rem', borderRight: '1px solid #e2e8f0' },
  right:  { padding: '1.75rem 2rem 1.75rem 1.5rem', background: '#fafafa' },
  footer: { borderTop: '1px solid #e2e8f0', padding: '0.65rem 2.5rem', fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center' },
};

const text = {
  body:     { fontSize: '0.8rem', color: '#374151', lineHeight: 1.65, margin: '0 0 0.5rem' },
  jobTitle: { fontSize: '0.88rem', fontWeight: 700, color: '#1e1b4b', margin: '0 0 0.15rem' },
  company:  { fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, margin: '0 0 0.35rem', display: 'flex', alignItems: 'center' },
  date:     { fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', margin: 0, whiteSpace: 'nowrap' },
  bullets:  { margin: '0.3rem 0 0 0', paddingLeft: '1rem' },
  bullet:   { fontSize: '0.78rem', color: '#374151', lineHeight: 1.6, marginBottom: '0.2rem' },
  link:     { fontSize: '0.68rem', padding: '0.15rem 0.5rem', background: '#ede9fe', color: '#4f46e5', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' },
};

const chip = {
  fontSize: '0.65rem', padding: '0.15rem 0.45rem',
  background: '#ede9fe', color: '#4338ca',
  borderRadius: '4px', fontWeight: 600,
  letterSpacing: '0.02em',
};
