import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticlesBg from '../../../components/ui/ParticlesBg';
import styles from './HeroSection.module.css';

function getTechIcon(name) {
  const n = name.toLowerCase().trim();
  if (n.includes('react')) return ['fab','react'];
  if (n.includes('node')) return ['fab','node-js'];
  if (n.includes('js') || n.includes('javascript')) return ['fab','js'];
  if (n.includes('ts') || n.includes('typescript')) return ['fab','js'];
  if (n.includes('python')) return ['fab','python'];
  if (n.includes('java')) return ['fab','java'];
  if (n.includes('sql') || n.includes('postgres') || n.includes('mongo') || n.includes('database')) return 'database';
  if (n.includes('docker')) return ['fab','docker'];
  if (n.includes('aws') || n.includes('cloud')) return ['fab','aws'];
  if (n.includes('css') || n.includes('tailwind')) return ['fab','css3-alt'];
  if (n.includes('html')) return ['fab','html5'];
  if (n.includes('git')) return ['fab','git-alt'];
  if (n.includes('linux')) return ['fab','linux'];
  if (n.includes('figma')) return ['fab','figma'];
  return 'code'; 
}

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function HeroSection({ settings }) {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 150]);
  const avatarRotate = useTransform(scrollY, [0, 500], [0, 10]);

  const rolesArray = settings?.hero_roles
    ? settings.hero_roles.split(',').map(r => r.trim()).filter(Boolean)
    : ['Full-Stack Developer', 'Problem Solver', 'Open to Opportunities'];

  const typedRole = useTypingAnimation(rolesArray);
  const heroTitle = settings?.hero_title || "Hi, I'm a Developer";
  const avatarKey = settings?.avatar_key;
  const cvKey     = settings?.cv_key;

  const githubUrl   = settings?.social_github   || 'https://github.com';
  const linkedinUrl = settings?.social_linkedin  || 'https://linkedin.com';
  const twitterUrl  = settings?.social_twitter   || '';

  const techArray = settings?.hero_tech
    ? settings.hero_tech.split(',').map(t => t.trim()).filter(Boolean)
    : ['React', 'Node.js', 'PostgreSQL', 'JavaScript'];

  return (
    <section id="hero" className={styles.hero} aria-label="Hero">
      <div className={styles.ambient}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grid} />
      </div>

      <ParticlesBg />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.inner}>

          {avatarKey && (
            <motion.div 
              className={styles.avatarWrap}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
              style={{ y: yParallax, rotate: avatarRotate }}
            >
              <img src={`/api/assets/${avatarKey}`} alt="Profile" className={styles.avatar} loading="eager" />
              <div className={styles.avatarRing} />
              <div className={styles.availableDot} title="Available for work" />
            </motion.div>
          )}

          <motion.div 
            className={styles.textBlock}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={itemVariants} className="section-label" style={{ marginBottom: '1rem' }}>
              <Icon icon="code" style={{ marginRight: '0.5rem' }} />Hello, World!
            </motion.span>

            <motion.h1 variants={itemVariants} className={styles.title}>
              {heroTitle}
            </motion.h1>

            <motion.p variants={itemVariants} className={styles.subtitle}>
              {typedRole}<span className="typing-cursor" aria-hidden="true" />
            </motion.p>

            <motion.div variants={itemVariants} className={styles.actions}>
              <motion.a 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                href="#contact" className="btn btn-primary btn-lg interactive" id="hero-contact-btn"
              >
                <Icon icon="paper-plane" /> Get in Touch
              </motion.a>
              {cvKey && (
                <motion.a 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  href={`/api/assets/${cvKey}`} className="btn btn-outline btn-lg interactive" download id="hero-cv-btn"
                >
                  <Icon icon="download" /> Download CV
                </motion.a>
              )}
              <motion.a 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                href="/resume" className="btn btn-ghost btn-lg interactive" id="hero-resume-btn"
              >
                <Icon icon="file-lines" style={{ marginRight: '0.4rem' }} /> Auto-Resume
              </motion.a>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.socials}>
              {[
                { url: githubUrl, icon: ['fab','github'], label: 'GitHub' },
                { url: linkedinUrl, icon: ['fab','linkedin'], label: 'LinkedIn' },
                ...(twitterUrl ? [{ url: twitterUrl, icon: ['fab','twitter'], label: 'Twitter' }] : [])
              ].map(link => (
                <motion.a 
                  key={link.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href={link.url} target="_blank" rel="noopener noreferrer" 
                  className={`${styles.socialLink} interactive`} aria-label={link.label}
                >
                  <Icon icon={link.icon} />
                </motion.a>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className={styles.pills}>
              {techArray.map((label, i) => (
                <motion.span 
                  key={label} 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 0.15)' }}
                  className="tag interactive"
                >
                  <Icon icon={getTechIcon(label)} style={{ marginRight: '0.35rem' }} />{label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        className={styles.scrollHint} 
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className={styles.scrollLine} />
        <Icon icon="chevron-down" style={{ fontSize: '0.75rem' }} />
      </motion.div>
    </section>
  );
}
