import { useEffect, useRef, useState, useCallback } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

/* ── Tech icon mapper ─────────────────────────────────────── */
function getTechIcon(name) {
  const n = name.toLowerCase().trim();
  if (n.includes('react'))   return ['fab','react'];
  if (n.includes('node'))    return ['fab','node-js'];
  if (n.includes('js') || n.includes('javascript')) return ['fab','js'];
  if (n.includes('ts') || n.includes('typescript'))  return ['fab','js'];
  if (n.includes('python'))  return ['fab','python'];
  if (n.includes('java'))    return ['fab','java'];
  if (n.includes('sql') || n.includes('postgres') || n.includes('mongo') || n.includes('database')) return 'database';
  if (n.includes('docker'))  return ['fab','docker'];
  if (n.includes('aws') || n.includes('cloud')) return ['fab','aws'];
  if (n.includes('css') || n.includes('tailwind')) return ['fab','css3-alt'];
  if (n.includes('html'))    return ['fab','html5'];
  if (n.includes('git'))     return ['fab','git-alt'];
  if (n.includes('linux'))   return ['fab','linux'];
  if (n.includes('figma'))   return ['fab','figma'];
  return 'code';
}

/* ── Typing animation ─────────────────────────────────────── */
function useTypingAnimation(strings, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [phase,   setPhase]   = useState('typing');
  const [index,   setIndex]   = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (!strings || strings.length === 0) return;
    const current = strings[index % strings.length];
    let timer;
    if (phase === 'typing') {
      if (charIdx < current.length) {
        timer = setTimeout(() => { setDisplay(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, speed);
      } else {
        timer = setTimeout(() => setPhase('deleting'), pause);
      }
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => { setDisplay(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, speed / 2);
      } else {
        setIndex(i => i + 1); setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [charIdx, phase, index, strings, speed, pause]);

  return display;
}

/* ── 3D tilt on avatar ────────────────────────────────────── */
function use3DTilt(ref) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    setTilt({
      rotateX: -(y / (rect.height / 2)) * 12,
      rotateY:  (x / (rect.width  / 2)) * 12,
    });
  }, [ref]);

  const handleLeave = useCallback(() => setTilt({ rotateX: 0, rotateY: 0 }), []);

  return { tilt, handleMove, handleLeave };
}

export default function HeroSection({ settings }) {
  const avatarRef = useRef(null);
  const { tilt, handleMove, handleLeave } = use3DTilt(avatarRef);

  const rolesArray = settings?.hero_roles
    ? settings.hero_roles.split(',').map(r => r.trim()).filter(Boolean)
    : ['Full-Stack Developer', 'Problem Solver', 'Open to Opportunities'];

  const typedRole  = useTypingAnimation(rolesArray);
  const heroTitle  = settings?.hero_title || "Hi, I'm a Developer";
  const avatarKey  = settings?.avatar_key;
  const cvKey      = settings?.cv_key;

  const githubUrl   = settings?.social_github   || 'https://github.com';
  const linkedinUrl = settings?.social_linkedin  || 'https://linkedin.com';
  const twitterUrl  = settings?.social_twitter   || '';

  const techArray = settings?.hero_tech
    ? settings.hero_tech.split(',').map(t => t.trim()).filter(Boolean)
    : ['React', 'Node.js', 'PostgreSQL', 'JavaScript'];

  const socialLinks = [
    { url: githubUrl,   icon: ['fab','github'],   label: 'GitHub' },
    { url: linkedinUrl, icon: ['fab','linkedin'],  label: 'LinkedIn' },
    ...(twitterUrl ? [{ url: twitterUrl, icon: ['fab','twitter'], label: 'Twitter' }] : []),
  ];

  const containerV = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  const itemV = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <section id="hero" className="hero" aria-label="Hero" style={{ position: 'relative', overflow: 'hidden' }}>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className={`hero-grid${avatarKey ? '' : ' no-avatar'}`}>

          {/* ── Avatar ── */}
          {avatarKey && (
            <div className="hero-avatar-wrapper">
              <motion.div
                ref={avatarRef}
                className="hero-avatar-3d"
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                style={{
                  perspective: '800px',
                  transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                  transition: 'transform 0.15s ease',
                }}>
                <div className="hero-avatar-3d-inner">
                  <div className="hero-avatar-img-wrap">
                    <img
                      src={`/api/assets/${avatarKey}`}
                      alt="Profile"
                      className="hero-avatar-img"
                      loading="eager"
                    />
                  </div>
                  <div className="hero-avatar-ring" />
                  <span className="hero-status-dot" title="Available for work" />
                </div>
              </motion.div>
            </div>
          )}

          {/* ── Text content ── */}
          <motion.div
            className="hero-content"
            variants={containerV}
            initial="hidden"
            animate="visible">

            <motion.div variants={itemV}>
              <span className="hero-badge">
                <Icon icon="code" /> Hello, World!
              </span>
            </motion.div>

            <motion.h1 className="hero-title" variants={itemV}>
              {heroTitle}
            </motion.h1>

            <motion.div className="hero-role-wrap" variants={itemV}>
              <span>{typedRole}</span>
              <span className="hero-cursor" aria-hidden="true" />
            </motion.div>

            <motion.div className="hero-actions" variants={itemV}>
              <motion.a
                href="#contact"
                className="btn btn-primary"
                id="hero-contact-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}>
                <Icon icon="paper-plane" /> Get in Touch
              </motion.a>
              {cvKey && (
                <motion.a
                  href={`/api/assets/${cvKey}`}
                  download
                  className="btn btn-ghost"
                  id="hero-cv-btn"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}>
                  <Icon icon="download" /> Download CV
                </motion.a>
              )}
            </motion.div>

            <motion.div className="hero-socials" variants={itemV}>
              {socialLinks.map(link => (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="hero-social-link"
                  whileHover={{ scale: 1.12, y: -3 }}
                  whileTap={{ scale: 0.9 }}>
                  <Icon icon={link.icon} />
                </motion.a>
              ))}
            </motion.div>

            <motion.div className="hero-tech-badges" variants={itemV}>
              {techArray.map((label, i) => (
                <motion.span
                  key={label}
                  className="hero-tech-badge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  whileHover={{ y: -4 }}>
                  <Icon icon={getTechIcon(label)} /> {label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll"
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}>
        <div className="hero-scroll-line" />
        <span>scroll</span>
      </motion.div>
    </section>
  );
}
