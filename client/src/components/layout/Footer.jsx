export default function Footer({ settings }) {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer} role="contentinfo">
      <div style={styles.line} />
      <div className="container" style={styles.inner}>
        <div style={styles.left}>
          <span style={styles.logo} className="gradient-text">⬡ Portfolio</span>
          <p style={styles.sub}>{settings?.footer_text || 'Built with React · Node.js · PostgreSQL'}</p>
        </div>
        <p style={styles.copy}>© {year} · All rights reserved</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: 'var(--bg-surface)', marginTop: '2rem' },
  line:   { height: '1px', background: 'linear-gradient(to right, transparent, var(--border-default), transparent)' },
  inner:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBlock: '2rem' },
  left:   { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  logo:   { fontWeight: 800, fontSize: '1.1rem' },
  sub:    { fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 },
  copy:   { fontSize: '0.8rem', color: 'var(--text-muted)' },
};
