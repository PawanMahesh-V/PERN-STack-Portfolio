import { useEffect, useState, useCallback, useRef } from 'react';
import { getCertificates, createCertificate, updateCertificate, deleteCertificate } from '../../api/certificatesApi';
import { getAllSections } from '../../api/sectionsApi';
import { uploadAsset } from '../../api/assetsApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

const EMPTY = { section_id: '', title: '', issuer: '', image_url: '', issue_date: '', cert_url: '' };

export default function CertificatesPage() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [certs,    setCerts]    = useState([]);
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    Promise.all([getCertificates(), getAllSections()])
      .then(([{ data: c }, { data: s }]) => {
        setCerts(c.certificates);
        setSections(s.sections.filter(s => s.type === 'certificates'));
      })
      .catch(() => toast('Failed to load.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const openCreate = () => { setForm({ ...EMPTY, section_id: sections[0]?.id || '' }); setModal({ mode: 'create' }); };
  const openEdit   = (c)  => { setForm({ ...c, issue_date: c.issue_date ? c.issue_date.substring(0, 10) : '' }); setModal({ mode: 'edit', data: c }); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadAsset(file);
      setForm(p => ({ ...p, image_url: url }));
      toast('Image uploaded.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') { await createCertificate(form); toast('Certificate added!', 'success'); }
      else { await updateCertificate(modal.data.id, form); toast('Certificate updated!', 'success'); }
      setModal(null); load();
    } catch (err) { toast(err.response?.data?.error || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    try { await deleteCertificate(id); toast('Deleted.', 'success'); load(); }
    catch { toast('Delete failed.', 'error'); }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.pageTitle}>Certificates <span className="gradient-text">Manager</span></h1>
          <p style={styles.pageSub}>Showcase your credentials and achievements.</p>
        </div>
        <button id="create-cert-btn" onClick={openCreate} className="btn btn-primary" disabled={sections.length === 0}>+ Add Certificate</button>
      </div>

      {sections.length === 0 && !loading && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Create a section of type <code>certificates</code> first.
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {certs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No certificates yet.</div>
          ) : certs.map((c, i) => (
            <div key={c.id} style={{ ...styles.row, borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
              {c.image_url && <img src={c.image_url} alt={c.title} style={styles.thumb} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{c.title}</p>
                <p style={styles.meta}>{c.issuer} {c.issue_date && `· ${new Date(c.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}</p>
              </div>
              <button onClick={() => openEdit(c)} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm btn-icon" aria-label="Delete">✕</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2 className="modal-title">{modal.mode === 'create' ? 'Add Certificate' : 'Edit Certificate'}</h2>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cert-section">Section</label>
                <select id="cert-section" className="form-select" value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value }))}>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cert-title">Title *</label>
                <input id="cert-title" type="text" className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cert-issuer">Issuer / Organisation</label>
                <input id="cert-issuer" type="text" className="form-input" value={form.issuer || ''} onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cert-date">Issue Date</label>
                  <input id="cert-date" type="date" className="form-input" value={form.issue_date || ''} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Certificate Image / Badge (Optional)</label>
                  <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageUpload} />
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {form.image_url ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
                        <img src={form.image_url} alt="Preview" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '2px' }} />
                        <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="btn btn-ghost btn-icon btn-sm" aria-label="Remove image">
                          <Icon icon="trash" style={{ color: 'var(--text-danger)' }} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-outline" disabled={uploading}>
                        {uploading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} /> : <Icon icon="upload" style={{ marginRight: '0.5rem' }} />}
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cert-url">Credential Link</label>
                <input id="cert-url" type="url" className="form-input" value={form.cert_url || ''} onChange={e => setForm(p => ({ ...p, cert_url: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '…' : modal.mode === 'create' ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
  pageSub:   { color: 'var(--text-muted)', fontSize: '0.9rem' },
  row:       { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' },
  thumb:     { width: '48px', height: '48px', objectFit: 'contain', borderRadius: 'var(--r-sm)', background: 'var(--bg-surface)', padding: '4px', flexShrink: 0 },
  meta:      { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' },
};
