import { useEffect, useState, useCallback, useRef } from 'react';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../../api/experiencesApi';
import { getAllSections } from '../../api/sectionsApi';
import { uploadAsset } from '../../api/assetsApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY = { section_id: '', role: '', company: '', location: '', start_date: '', end_date: '', is_current: false, description: '', bullets: [], logo_url: '' };

export default function ExperiencePage() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [exp,       setExp]       = useState([]);
  const [sections,  setSections]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    Promise.all([getExperiences(), getAllSections()])
      .then(([{ data: e }, { data: s }]) => {
        setExp(e.experiences);
        setSections(s.sections.filter(s => s.type === 'experience'));
      })
      .catch(() => toast('Failed to load.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const openCreate = () => { setForm({ ...EMPTY, section_id: sections[0]?.id || '' }); setModal({ mode: 'create' }); };
  const openEdit   = (e)  => { setForm({ ...e, start_date: e.start_date?.substring(0,10) || '', end_date: e.end_date?.substring(0,10) || '' }); setModal({ mode: 'edit', data: e }); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadAsset(file);
      setForm(p => ({ ...p, logo_url: `/api/assets/${data.asset.key}` }));
      toast('Logo uploaded.', 'success');
    } catch (err) { toast(err.response?.data?.error || 'Upload failed.', 'error'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, bullets: form.bullets.filter(b => b.trim() !== ''), end_date: form.is_current ? null : form.end_date };
    try {
      if (modal.mode === 'create') { await createExperience(payload); toast('Experience added!', 'success'); }
      else { await updateExperience(modal.data.id, payload); toast('Updated!', 'success'); }
      setModal(null); load();
    } catch (err) { toast(err.response?.data?.error || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience?')) return;
    try { await deleteExperience(id); toast('Deleted.', 'success'); load(); }
    catch { toast('Delete failed.', 'error'); }
  };

  // Bullet point handlers
  const updateBullet = (idx, val) => setForm(p => ({ ...p, bullets: p.bullets.map((b, i) => i === idx ? val : b) }));
  const removeBullet = (idx) => setForm(p => ({ ...p, bullets: p.bullets.filter((_, i) => i !== idx) }));
  const addBullet    = () => setForm(p => ({ ...p, bullets: [...p.bullets, ''] }));

  return (
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Experience <span>Manager</span></h1>
          <p className="ap-sub">Add your work history and professional experience.</p>
        </div>
        <button className="btn-admin-primary" id="create-exp-btn" onClick={openCreate} disabled={sections.length === 0}>
          <Icon icon="plus" /> Add Experience
        </button>
      </div>

      {sections.length === 0 && !loading && (
        <div className="ap-alert"><Icon icon="triangle-exclamation" /> Create an <code>experience</code> section first.</div>
      )}

      <div className="ap-card">
        {loading ? <div className="loader" style={{ margin: '3rem auto' }} /> : (
          <div className="ap-table-wrap">
            {exp.length === 0 ? (
              <div className="ap-empty">
                <Icon icon="briefcase" className="ap-empty-icon" />
                <p>No experience entries yet.</p>
              </div>
            ) : (
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Role & Company</th>
                    <th>Duration</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exp.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {e.logo_url ? (
                            <img src={e.logo_url} alt={e.company} className="exp-table-logo" />
                          ) : (
                            <div className="exp-table-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Icon icon="building" /></div>
                          )}
                          <div>
                            <div className="td-title">{e.role}</div>
                            <div className="td-meta">{e.company} {e.location && `· ${e.location}`}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="td-mono">
                          {e.start_date ? new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                          {' - '}
                          {e.is_current ? 'Present' : (e.end_date ? new Date(e.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—')}
                        </div>
                      </td>
                      <td>
                        <span className="exp-table-bullet-count">
                          {e.bullets?.length || 0} bullets
                        </span>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn-admin-icon btn-admin-icon-edit" onClick={() => openEdit(e)} title="Edit"><Icon icon="pencil" /></button>
                          <button className="btn-admin-icon btn-admin-icon-del" onClick={() => handleDelete(e.id)} title="Delete"><Icon icon="trash" /></button>
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
            <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} role="dialog" style={{ maxWidth: '640px' }}>
              <div className="modal-header">
                <div className="modal-title"><Icon icon={modal.mode === 'create' ? 'plus' : 'pencil'} />{modal.mode === 'create' ? 'Add Experience' : 'Edit Experience'}</div>
                <button className="modal-close" onClick={() => setModal(null)}><Icon icon="xmark" /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-sec">Section</label>
                    <select id="exp-sec" className="form-input" value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value }))}>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="exp-role">Role / Job Title *</label>
                      <input id="exp-role" className="form-input" type="text" required value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="exp-company">Company *</label>
                      <input id="exp-company" className="form-input" type="text" required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input className="form-input" type="date" value={form.start_date || ''} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input className="form-input" type="date" disabled={form.is_current} value={form.end_date || ''} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <input type="checkbox" checked={form.is_current} onChange={e => setForm(p => ({ ...p, is_current: e.target.checked }))} /> I currently work here
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bullet Points</label>
                    <div className="bullet-list">
                      {form.bullets.map((b, i) => (
                        <div key={i} className="bullet-row">
                          <input className="form-input" value={b} onChange={e => updateBullet(i, e.target.value)} placeholder="e.g. Developed key features using React" />
                          <button type="button" className="btn-admin-icon btn-admin-icon-del" onClick={() => removeBullet(i)}><Icon icon="xmark" /></button>
                        </div>
                      ))}
                      <button type="button" className="bullet-add-btn" onClick={addBullet}><Icon icon="plus" /> Add bullet point</button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Logo URL</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input className="form-input" type="text" value={form.logo_url || ''} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} placeholder="/api/assets/..." style={{ flex: 1 }} />
                      <button type="button" className="btn-admin-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Icon icon="spinner" spin /> : <Icon icon="upload" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-admin-secondary" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-admin-primary" disabled={saving}>
                    {saving ? <><Icon icon="spinner" spin /> Saving…</> : modal.mode === 'create' ? 'Add Experience' : 'Save Changes'}
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
