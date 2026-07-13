import { useEffect, useState, useCallback, useRef } from 'react';
import { getCertificates, createCertificate, updateCertificate, deleteCertificate } from '../../api/certificatesApi';
import { getAllSections } from '../../api/sectionsApi';
import { uploadAsset } from '../../api/assetsApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

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
      const { data } = await uploadAsset(file);
      setForm(p => ({ ...p, image_url: `/api/assets/${data.asset.key}` }));
      toast('Image uploaded.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
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
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Certificates <span>Manager</span></h1>
          <p className="ap-sub">Showcase your credentials and achievements.</p>
        </div>
        <button className="btn-admin-primary" id="create-cert-btn" onClick={openCreate} disabled={sections.length === 0}>
          <Icon icon="plus" /> Add Certificate
        </button>
      </div>

      {sections.length === 0 && !loading && (
        <div className="ap-alert">
          <Icon icon="triangle-exclamation" />
          Create a section of type <code>certificates</code> first.
        </div>
      )}

      <div className="ap-card">
        {loading ? <div className="loader" style={{ margin: '3rem auto' }} /> : (
          <div className="ap-table-wrap">
            {certs.length === 0 ? (
              <div className="ap-empty">
                <Icon icon="certificate" className="ap-empty-icon" />
                <p>No certificates yet. Click "Add Certificate" to get started.</p>
              </div>
            ) : (
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Certificate</th>
                    <th>Issuer & Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {c.image_url ? (
                            <img src={c.image_url} alt={c.title} className="td-thumb" />
                          ) : (
                            <div className="td-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <Icon icon="certificate" />
                            </div>
                          )}
                          <div className="td-title">{c.title}</div>
                        </div>
                      </td>
                      <td>
                        <div className="td-meta" style={{ marginTop: 0 }}>
                          {c.issuer}
                          <br/>
                          {c.issue_date && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                            {new Date(c.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>}
                        </div>
                      </td>
                      <td>
                        <div className="td-actions">
                          {c.cert_url && (
                            <a href={c.cert_url} target="_blank" rel="noopener noreferrer" className="btn-admin-icon" style={{ color: 'var(--accent-primary)' }} title="View Link">
                              <Icon icon="arrow-up-right-from-square" />
                            </a>
                          )}
                          <button className="btn-admin-icon btn-admin-icon-edit" onClick={() => openEdit(c)} title="Edit"><Icon icon="pencil" /></button>
                          <button className="btn-admin-icon btn-admin-icon-del" onClick={() => handleDelete(c.id)} title="Delete"><Icon icon="trash" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} role="dialog">
              <div className="modal-header">
                <div className="modal-title"><Icon icon={modal.mode === 'create' ? 'plus' : 'pencil'} />{modal.mode === 'create' ? 'Add Certificate' : 'Edit Certificate'}</div>
                <button className="modal-close" onClick={() => setModal(null)}><Icon icon="xmark" /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-section">Section</label>
                    <select id="cert-section" className="form-input" value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value }))}>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-title">Title *</label>
                    <input id="cert-title" className="form-input" type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. AWS Certified Developer" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-issuer">Issuer</label>
                    <input id="cert-issuer" className="form-input" type="text" value={form.issuer || ''} onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} placeholder="e.g. Amazon Web Services" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="cert-date">Issue Date</label>
                      <input id="cert-date" className="form-input" type="date" value={form.issue_date || ''} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Image / Badge</label>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {form.image_url && <img src={form.image_url} alt="Preview" className="td-thumb" style={{ width: '40px', height: '40px' }} />}
                        <button type="button" className="btn-admin-secondary" style={{ flex: 1, padding: '0.4rem' }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          {uploading ? <Icon icon="spinner" spin /> : <Icon icon="upload" />}
                        </button>
                        {form.image_url && (
                          <button type="button" className="btn-admin-icon btn-admin-icon-del" onClick={() => setForm(p => ({ ...p, image_url: '' }))}>
                            <Icon icon="xmark" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cert-url">Credential Link</label>
                    <input id="cert-url" className="form-input" type="url" value={form.cert_url || ''} onChange={e => setForm(p => ({ ...p, cert_url: e.target.value }))} placeholder="https://…" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-admin-secondary" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-admin-primary" disabled={saving}>
                    {saving ? <><Icon icon="spinner" spin /> Saving…</> : modal.mode === 'create' ? 'Add Certificate' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
