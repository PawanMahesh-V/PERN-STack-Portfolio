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



const SEO_FIELDS = [
  { key: 'seo_title',       label: 'SEO Browser Title',    placeholder: 'My Name — Full-Stack Developer' },
  { key: 'seo_description', label: 'SEO Meta Description', placeholder: 'Portfolio of a full-stack developer.' },
  { key: 'footer_text',     label: 'Footer Text',          placeholder: 'Built with React · Node.js' },
];

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button type="button" className={`tiptap-btn${active ? ' active' : ''}`} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

function AboutEditor({ value, onSave, saving }) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Tell visitors about yourself…' })],
    content: value || '',
    editorProps: { attributes: { class: 'ProseMirror' } },
  });

  useEffect(() => { if (editor && value && editor.isEmpty) editor.commands.setContent(value); }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="settings-field">
      <div className="tiptap-wrap">
        <div className="tiptap-toolbar">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><Icon icon="list-ul" /></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><Icon icon="list-ol" /></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading',{level:3})} title="Heading 3">H3</ToolbarBtn>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />
          <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting"><Icon icon="eraser" /></ToolbarBtn>
        </div>
        <div className="tiptap-editor-wrap">
          <EditorContent editor={editor} />
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="settings-save-btn" onClick={() => onSave(editor.getHTML())} disabled={saving}>
          {saving ? <Icon icon="spinner" spin /> : 'Save About Text'}
        </button>
      </div>
    </div>
  );
}

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
      toast(`Saved ${key.replace(/_/g, ' ')}`, 'success');
    } catch { toast('Failed to save.', 'error'); }
    finally { setSaving(''); }
  };

  const handleUpload = async (assetKey, file) => {
    if (!file) return;
    setUploading(assetKey);
    const fd = new FormData(); fd.append('file', file); fd.append('asset_key', assetKey);
    try {
      const { data } = await uploadAsset(fd);
      toast(`${assetKey} uploaded! ${data.asset.compression_ratio}`, 'success');
      setSettings(p => ({ ...p, [`${assetKey}_key`]: assetKey }));
      setUploadTs(Date.now());
    } catch (err) { toast(err.response?.data?.error || 'Upload failed.', 'error'); }
    finally { setUploading(''); }
  };

  const renderFieldGroup = (title, icon, fields) => (
    <div className="settings-card">
      <div className="settings-card-header"><Icon icon={icon} /> {title}</div>
      <div className="settings-card-body">
        {fields.map(f => (
          <div key={f.key} className="settings-field">
            <label className="settings-field-label" htmlFor={`setting-${f.key}`}>{f.label}</label>
            <div className="settings-field-row">
              <input
                id={`setting-${f.key}`}
                className="form-input"
                type="text"
                placeholder={f.placeholder}
                value={settings[f.key] ?? ''}
                onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} />
              <button className="settings-save-btn" onClick={() => handleSave(f.key)} disabled={saving === f.key}>
                {saving === f.key ? <Icon icon="spinner" spin /> : 'Save'}
              </button>
            </div>
            {f.hint && <div className="settings-field-hint">{f.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="page-loading"><div className="loader" /></div>;

  return (
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Site <span>Settings</span></h1>
          <p className="ap-sub">Control global content and assets across your portfolio.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {renderFieldGroup('Hero Section', 'wand-magic-sparkles', HERO_FIELDS)}
          {renderFieldGroup('SEO & Footer', 'magnifying-glass', SEO_FIELDS)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {renderFieldGroup('Contact Info', 'address-card', CONTACT_FIELDS)}
        </div>

        {/* About Text */}
        <div className="settings-card">
          <div className="settings-card-header"><Icon icon="user-pen" /> About Me Text</div>
          <div className="settings-card-body">
            <AboutEditor value={settings.about_text ?? ''} saving={saving === 'about_text'} onSave={html => handleSave('about_text', html)} />
          </div>
        </div>

        {/* File Assets */}
        <div className="settings-card">
          <div className="settings-card-header"><Icon icon="cloud" /> File Assets</div>
          <div className="settings-card-body upload-cards-grid">
            <UploadCard
              label="Profile Photo"
              accept="image/*"
              current={settings.avatar_key ? `/api/assets/avatar?t=${uploadTs}` : null}
              loading={uploading === 'avatar'}
              hint="JPEG/PNG/WebP — auto-compressed to WebP @ 75%"
              onUpload={f => handleUpload('avatar', f)} />
            <UploadCard
              label="CV / Resume (PDF)"
              accept=".pdf"
              current={settings.cv_key ? `/api/assets/cv?t=${uploadTs}` : null}
              loading={uploading === 'cv'}
              hint="PDF only — max 10 MB"
              isPdf
              onUpload={f => handleUpload('cv', f)} />
          </div>
        </div>

        {/* Social Links */}
        <div className="settings-card">
          <div className="settings-card-header"><Icon icon="link" /> Social Links</div>
          <div className="settings-card-body">
            {[
              { key: 'social_github',   label: 'GitHub',   icon: ['fab','github'],   placeholder: 'https://github.com/…' },
              { key: 'social_linkedin', label: 'LinkedIn', icon: ['fab','linkedin'], placeholder: 'https://linkedin.com/in/…' },
              { key: 'social_twitter',  label: 'Twitter',  icon: ['fab','twitter'],  placeholder: 'https://twitter.com/…' },
            ].map(f => (
              <div key={f.key} className="settings-field">
                <label className="settings-field-label">{f.label}</label>
                <div className="social-row">
                  <div className="social-row-icon"><Icon icon={f.icon} /></div>
                  <div className="settings-field-row" style={{ flex: 1 }}>
                    <input
                      className="form-input" type="url" placeholder={f.placeholder}
                      value={settings[f.key] ?? ''} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} />
                    <button className="settings-save-btn" onClick={() => handleSave(f.key)} disabled={saving === f.key}>
                      {saving === f.key ? <Icon icon="spinner" spin /> : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Export */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="settings-card">
            <div className="settings-card-header"><Icon icon="shield-halved" /> Security Settings</div>
            <div className="settings-card-body" style={{ gap: '2rem' }}>
              <EmailChange />
              <PasswordChange />
            </div>
          </div>
          <div className="settings-card">
            <div className="settings-card-header"><Icon icon="download" /> Backup & Export</div>
            <div className="settings-card-body">
              <p className="ap-sub" style={{ marginTop: 0 }}>Download a full PDF backup of all your portfolio data.</p>
              <div className="settings-actions-row">
                <a href="/api/export/all" download className="btn-admin-secondary" onClick={e => { if (!localStorage.getItem('portfolio_token')) { e.preventDefault(); toast('You must be logged in.', 'error'); } }}>
                  <Icon icon="file-pdf" /> Export PDF Backup
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordChange() {
  const toast = useToast();
  const [form,   setForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast('Passwords do not match.', 'error');
    if (form.newPassword.length < 8) return toast('New password must be at least 8 chars.', 'error');
    setSaving(true);
    try {
      const token = localStorage.getItem('portfolio_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="settings-field-label" style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Change Password</div>
      <input className="form-input" type="password" placeholder="Current Password" required value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} />
      <input className="form-input" type="password" placeholder="New Password" required value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} />
      <input className="form-input" type="password" placeholder="Confirm New Password" required value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
      <button type="submit" className="btn-admin-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
        {saving ? <Icon icon="spinner" spin /> : 'Update Password'}
      </button>
    </form>
  );
}

function EmailChange() {
  const toast = useToast();
  const [form,   setForm]   = useState({ currentPassword: '', newEmail: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.newEmail.includes('@')) return toast('Enter a valid email.', 'error');
    setSaving(true);
    try {
      const token = localStorage.getItem('portfolio_token');
      const res = await fetch('/api/auth/change-email', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newEmail: form.newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Email changed successfully!', 'success');
      setForm({ currentPassword: '', newEmail: '' });
    } catch (err) { toast(err.message || 'Failed to change email.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="settings-field-label" style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Change Admin Email</div>
      <input className="form-input" type="email" placeholder="New Email Address" required value={form.newEmail} onChange={e => setForm(p => ({ ...p, newEmail: e.target.value }))} />
      <input className="form-input" type="password" placeholder="Current Password" required value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} />
      <button type="submit" className="btn-admin-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
        {saving ? <Icon icon="spinner" spin /> : 'Update Email'}
      </button>
    </form>
  );
}

function UploadCard({ label, accept, current, loading, hint, onUpload, isPdf }) {
  const [drag, setDrag] = useState(false);
  const handleFile = (file) => { if (file) onUpload(file); };

  return (
    <div className="upload-card">
      <div className="upload-card-label">{label}</div>
      {current && !isPdf && (
        <img src={current} alt={label} className="upload-preview" />
      )}
      {current && isPdf && (
        <a href={current} target="_blank" rel="noopener noreferrer" className="btn-admin-secondary" style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem' }}>
          <Icon icon="file-pdf" /> View Current CV
        </a>
      )}
      <label
        className={`upload-drop-zone${drag ? ' drag' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}>
        {loading ? <Icon icon="spinner" spin style={{ fontSize: '1.25rem' }} /> : (
          <>
            <Icon icon="cloud-arrow-up" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }} />
            <span>{current ? 'Drop to replace' : 'Drop file here or click'}</span>
            <input type="file" accept={accept} onChange={e => handleFile(e.target.files[0])} />
          </>
        )}
      </label>
      <div className="upload-card-hint">{hint}</div>
    </div>
  );
}
