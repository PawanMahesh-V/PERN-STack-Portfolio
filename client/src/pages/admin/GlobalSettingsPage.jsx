import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { getSettings, updateSetting, uploadAsset } from '../../api/settingsApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

const HERO_FIELDS = [
  { key: 'hero_title',    label: 'Hero Title',    placeholder: "Hi, I'm Your Name" },
  { key: 'hero_roles',    label: 'Typing Roles',  placeholder: 'Full-Stack Developer, Problem Solver', hint: 'Comma separated.' },
  { key: 'hero_tech',     label: 'Tech Pills',    placeholder: 'React, Node.js, PostgreSQL, JavaScript', hint: 'Comma separated.' },
];

const CONTACT_FIELDS = [
  { key: 'contact_email',         label: 'Contact Email',     placeholder: 'hello@example.com' },
  { key: 'contact_response_time', label: 'Response Time',     placeholder: 'Within 24 hours' },
  { key: 'contact_location',      label: 'Location / Based in',placeholder: 'Available worldwide' },
  { key: 'contact_open_to',       label: 'Open To',           placeholder: 'Freelance & Full-time roles' },
];

const RESUME_FIELDS = [
  { key: 'resume_subtitle',              label: 'Resume Subtitle',  placeholder: 'Full-Stack Developer · PERN Stack' },
  { key: 'resume_education_degree',      label: 'Education Degree', placeholder: 'Bachelor of Science, Computing' },
  { key: 'resume_education_institution', label: 'Institution',      placeholder: 'SZABIST University' },
  { key: 'resume_education_year',        label: 'Year / Duration',  placeholder: '2020 – 2024' },
  { key: 'resume_languages',             label: 'Languages',        placeholder: 'English (Professional), Urdu (Native)', hint: 'Comma separated.' },
];

const SEO_FIELDS = [
  { key: 'seo_title',       label: 'SEO Browser Title',    placeholder: 'My Name — Full-Stack Developer' },
  { key: 'seo_description', label: 'SEO Meta Description', placeholder: 'Portfolio of a full-stack developer.' },
  { key: 'footer_text',     label: 'Footer Text',          placeholder: 'Built with React · Node.js' },
];

// ── TipTap toolbar button ──────────────────────────────────────
function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? 'is-active' : ''}
      title={title}
    >
      {children}
    </button>
  );
}

// ── About rich text editor ─────────────────────────────────────
function AboutEditor({ value, onSave, saving }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Tell visitors about yourself…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'ProseMirror' },
    },
  });

  // Sync external value once on mount
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleSave = () => {
    if (!editor) return;
    onSave(editor.getHTML());
  };

  if (!editor) return null;

  return (
    <div>
      <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
        <Icon icon="user" style={{ marginRight: '0.4rem' }} /> About Me Text
      </label>
      <div className="tiptap-wrapper">
        <div className="tiptap-toolbar">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
            ☰
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
            1.
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading',{level:3})} title="Heading">
            H3
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">
            ✕
          </ToolbarBtn>
        </div>
        <div className="tiptap-content">
          <EditorContent editor={editor} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Icon icon="spinner" spin /> : 'Save About Text'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function GlobalSettingsPage() {
  const toast = useToast();
  const [settings,  setSettings]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState('');
  const [uploading, setUploading] = useState('');
  const [uploadTs,  setUploadTs]  = useState(Date.now());

  useEffect(() => {
    getSettings()
      .then(({ data }) => setSettings(data.settings))
      .catch(() => toast('Failed to load settings.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async (key, val) => {
    const value = val !== undefined ? val : (settings[key] ?? '');
    setSaving(key);
    try {
      await updateSetting(key, value);
      toast(`"${key}" saved!`, 'success');
    } catch {
      toast('Failed to save.', 'error');
    } finally {
      setSaving('');
    }
  };

  const handleUpload = async (assetKey, file) => {
    if (!file) return;
    setUploading(assetKey);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('asset_key', assetKey);
    try {
      const { data } = await uploadAsset(fd);
      toast(`${assetKey} uploaded! ${data.asset.compression_ratio}`, 'success');
      setSettings(p => ({ ...p, [`${assetKey}_key`]: assetKey }));
      setUploadTs(Date.now());
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed.', 'error');
    } finally {
      setUploading('');
    }
  };

  const renderFieldGroup = (title, icon, fields) => (
    <section style={styles.section} className="glass-card">
      <h2 style={styles.sectionTitle}><Icon icon={icon} style={{ marginRight: '0.5rem' }} />{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {fields.map(f => (
          <div key={f.key}>
            <label className="form-label" htmlFor={`setting-${f.key}`}>{f.label}</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.4rem' }}>
              <input
                id={`setting-${f.key}`}
                type="text"
                className="form-input"
                placeholder={f.placeholder}
                value={settings[f.key] ?? ''}
                onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSave(f.key)}
                disabled={saving === f.key}
                style={{ flexShrink: 0 }}
              >
                {saving === f.key ? <Icon icon="spinner" spin /> : 'Save'}
              </button>
            </div>
            {f.hint && <p className="form-hint" style={{ marginTop: '0.3rem' }}>{f.hint}</p>}
          </div>
        ))}
      </div>
    </section>
  );

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <h1 style={styles.pageTitle}>Site <span className="gradient-text">Settings</span></h1>
      <p style={styles.pageSub}>Control global content across your portfolio.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {renderFieldGroup('Hero Section', 'wand-magic-sparkles', HERO_FIELDS)}
        {renderFieldGroup('SEO & Footer', 'magnifying-glass', SEO_FIELDS)}
        {renderFieldGroup('Contact Info', 'address-card', CONTACT_FIELDS)}
        {renderFieldGroup('Resume & Education', 'file-lines', RESUME_FIELDS)}
      </div>

      {/* ── About Text ── */}
      <section style={styles.section} className="glass-card">
        <h2 style={styles.sectionTitle}><Icon icon="user-pen" style={{ marginRight: '0.5rem' }} />About Me Text</h2>
        <AboutEditor
          value={settings.about_text ?? ''}
          saving={saving === 'about_text'}
          onSave={html => handleSave('about_text', html)}
        />
      </section>

      {/* ── File Uploads ── */}
      <section style={styles.section} className="glass-card">
        <h2 style={styles.sectionTitle}><Icon icon="cloud" style={{ marginRight: '0.5rem' }} />File Assets</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="settings-grid">
          <UploadCard
            label="Profile Photo"
            accept="image/*"
            current={settings.avatar_key ? `/api/assets/avatar?t=${uploadTs}` : null}
            loading={uploading === 'avatar'}
            hint="JPEG/PNG/WebP — auto-compressed to WebP @ 75%"
            onUpload={f => handleUpload('avatar', f)}
          />
          <UploadCard
            label="CV / Resume (PDF)"
            accept=".pdf"
            current={settings.cv_key ? `/api/assets/cv?t=${uploadTs}` : null}
            loading={uploading === 'cv'}
            hint="PDF only — max 10 MB"
            isPdf
            onUpload={f => handleUpload('cv', f)}
          />
        </div>
      </section>

      {/* ── Social Links ── */}
      <section style={styles.section} className="glass-card">
        <h2 style={styles.sectionTitle}><Icon icon={['fab','github']} style={{ marginRight: '0.5rem' }} />Social Links</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'social_github',   label: 'GitHub URL',   icon: ['fab','github'],   placeholder: 'https://github.com/yourname' },
            { key: 'social_linkedin', label: 'LinkedIn URL', icon: ['fab','linkedin'], placeholder: 'https://linkedin.com/in/yourname' },
            { key: 'social_twitter',  label: 'Twitter URL',  icon: ['fab','twitter'],  placeholder: 'https://twitter.com/yourname' },
          ].map(f => (
            <div key={f.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '32px', color: 'var(--accent-primary)', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <Icon icon={f.icon} />
              </div>
              <input
                type="url"
                className="form-input"
                placeholder={f.placeholder}
                value={settings[f.key] ?? ''}
                onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSave(f.key)}
                disabled={saving === f.key}
                style={{ flexShrink: 0 }}
              >
                {saving === f.key ? <Icon icon="spinner" spin /> : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security Settings (Email & Password) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <EmailChange />
        <PasswordChange />
      </div>      {/* ── Export Data ── */}
      <section style={styles.section} className="glass-card">
        <h2 style={styles.sectionTitle}><Icon icon="download" style={{ marginRight: '0.5rem' }} />Backup & Export</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Download a full PDF backup of all your portfolio data, or view your auto-generated Resume.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/api/export/all"
            className="btn btn-outline"
            download
            id="export-data-btn"
            onClick={e => { if (!localStorage.getItem('token')) { e.preventDefault(); toast('You must be logged in to export.', 'error'); } }}
          >
            <Icon icon="file-pdf" style={{ marginRight: '0.5rem' }} />Export PDF Backup
          </a>
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            id="export-resume-btn"
          >
            <Icon icon="file-pdf" style={{ marginRight: '0.5rem' }} />View / Print Resume
          </a>
        </div>
      </section>
    </div>
  );
}



// ── Password Change Component ──────────────────────────────────
function PasswordChange() {
  const toast = useToast();
  const [form,   setForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast('Passwords do not match.', 'error'); return; }
    if (form.newPassword.length < 8) { toast('New password must be at least 8 characters.', 'error'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('portfolio_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Password changed successfully!', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast(err.message || 'Failed to change password.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <section style={{ padding: '1.75rem' }} className="glass-card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
        <Icon icon="lock" style={{ marginRight: '0.5rem' }} />Change Password
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px' }}>
        {[
          { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
          { key: 'newPassword',     label: 'New Password',     placeholder: 'Min 8 characters' },
          { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
        ].map(f => (
          <div className="form-group" key={f.key}>
            <label className="form-label" htmlFor={`pw-${f.key}`}>{f.label}</label>
            <div style={{ position: 'relative' }}>
              <input
                id={`pw-${f.key}`}
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required
              />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '-0.5rem' }}>
          <input id="show-pw" type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor: 'var(--accent-primary)' }} />
          <label htmlFor="show-pw" className="form-label" style={{ margin: 0 }}>Show passwords</label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? <><Icon icon="spinner" spin /> Changing…</> : <><Icon icon="lock" style={{ marginRight: '0.4rem' }} />Change Password</>}
        </button>
      </form>
    </section>
  );
}

// ── Email Change Component ─────────────────────────────────────
function EmailChange() {
  const toast = useToast();
  const [form,   setForm]   = useState({ currentPassword: '', newEmail: '' });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.newEmail.includes('@')) { toast('Please enter a valid email.', 'error'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('portfolio_token');
      const res = await fetch('/api/auth/change-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newEmail: form.newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Login email changed successfully!', 'success');
      setForm({ currentPassword: '', newEmail: '' });
    } catch (err) { toast(err.message || 'Failed to change email.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <section style={{ padding: '1.75rem' }} className="glass-card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
        <Icon icon="envelope" style={{ marginRight: '0.5rem' }} />Change Login Email
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor={`email-currentPassword`}>Current Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id={`email-currentPassword`}
              type={showPw ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`email-newEmail`}>New Login Email</label>
          <div style={{ position: 'relative' }}>
            <input
              id={`email-newEmail`}
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={form.newEmail}
              onChange={e => setForm(p => ({ ...p, newEmail: e.target.value }))}
              required
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '-0.5rem' }}>
          <input id="show-email-pw" type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor: 'var(--accent-primary)' }} />
          <label htmlFor="show-email-pw" className="form-label" style={{ margin: 0 }}>Show password</label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? <><Icon icon="spinner" spin /> Changing…</> : <><Icon icon="envelope" style={{ marginRight: '0.4rem' }} />Change Email</>}
        </button>
      </form>
    </section>
  );
}

function UploadCard({ label, accept, current, loading, hint, onUpload, isPdf }) {

  const [drag, setDrag] = useState(false);
  const handleFile = (file) => { if (file) onUpload(file); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
      {current && !isPdf && (
        <img src={current} alt={label} style={{ width: '100px', height: '100px', borderRadius: 'var(--r-md)', objectFit: 'cover', border: '2px solid var(--border-default)' }} />
      )}
      {current && isPdf && (
        <a href={current} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}>
          <Icon icon="file-pdf" style={{ marginRight: '0.35rem' }} /> View Current CV
        </a>
      )}
      <label
        style={{ ...styles.dropZone, borderColor: drag ? 'var(--accent-primary)' : 'var(--border-default)', background: drag ? 'rgba(99,102,241,0.08)' : 'var(--bg-surface)' }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      >
        {loading ? <span className="spinner" /> : (
          <>
            <Icon icon="cloud" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)', opacity: 0.6 }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {current ? 'Drop to replace' : 'Drop file here or click to browse'}
            </span>
            <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </>
        )}
      </label>
      <p className="form-hint">{hint}</p>
    </div>
  );
}

const styles = {
  pageTitle:    { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
  pageSub:      { color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' },
  section:      { padding: '1.75rem', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' },
  dropZone:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '2px dashed', borderRadius: 'var(--r-md)', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease' },
};
