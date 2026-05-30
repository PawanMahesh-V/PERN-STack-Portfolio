import { useEffect, useState, useCallback } from 'react';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../../api/experiencesApi';
import { getAllSections } from '../../api/sectionsApi';
import { useToast } from '../../context/ToastContext';

const EMPTY = { section_id: '', company: '', role: '', start_date: '', end_date: '', bullets: '', logo_url: '' };

export default function ExperiencePage() {
  const toast = useToast();
  const [items,    setItems]    = useState([]);
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(() => {
    Promise.all([getExperiences(), getAllSections()])
      .then(([{ data: e }, { data: s }]) => {
        setItems(e.experiences);
        setSections(s.sections.filter(s => s.type === 'experience'));
      })
      .catch(() => toast('Failed to load.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const openCreate = () => { setForm({ ...EMPTY, section_id: sections[0]?.id || '' }); setModal({ mode: 'create' }); };
  const openEdit   = (e)  => setModal({ mode: 'edit', data: e }) || setForm({
    ...e,
    start_date: e.start_date ? e.start_date.substring(0, 10) : '',
    end_date:   e.end_date   ? e.end_date.substring(0, 10)   : '',
    bullets:    (e.bullets || []).join('\n'),
  });

  const openEditForm = (e) => {
    setForm({
      ...e,
      start_date: e.start_date ? e.start_date.substring(0, 10) : '',
      end_date:   e.end_date   ? e.end_date.substring(0, 10)   : '',
      bullets:    (e.bullets || []).join('\n'),
    });
    setModal({ mode: 'edit', data: e });
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      bullets: form.bullets ? form.bullets.split('\n').map(l => l.trim()).filter(Boolean) : [],
    };
    try {
      if (modal.mode === 'create') { await createExperience(payload); toast('Experience added!', 'success'); }
      else { await updateExperience(modal.data.id, payload); toast('Experience updated!', 'success'); }
      setModal(null); load();
    } catch (err) { toast(err.response?.data?.error || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience?')) return;
    try { await deleteExperience(id); toast('Deleted.', 'success'); load(); }
    catch { toast('Delete failed.', 'error'); }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.pageTitle}>Experience <span className="gradient-text">Manager</span></h1>
          <p style={styles.pageSub}>Add your work history with role, dates, and bullet points.</p>
        </div>
        <button id="create-exp-btn" onClick={openCreate} className="btn btn-primary" disabled={sections.length === 0}>+ Add Experience</button>
      </div>

      {sections.length === 0 && !loading && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Create a section of type <code>experience</code> first.
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {items.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No experiences yet.</div>
          ) : items.map((exp, i) => (
            <div key={exp.id} style={{ ...styles.row, borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{exp.role}</p>
                <p style={styles.meta}>
                  {exp.company}
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>·</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    {' – '}
                    {exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                  </span>
                </p>
                {exp.bullets?.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {exp.bullets.length} bullet{exp.bullets.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button onClick={() => openEditForm(exp)} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={() => handleDelete(exp.id)} className="btn btn-danger btn-sm btn-icon" aria-label="Delete">✕</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{modal.mode === 'create' ? 'Add Experience' : 'Edit Experience'}</h2>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="exp-section">Section</label>
                <select id="exp-section" className="form-select" value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value }))}>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-company">Company *</label>
                  <input id="exp-company" type="text" className="form-input" required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-role">Role / Title *</label>
                  <input id="exp-role" type="text" className="form-input" required value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-start">Start Date</label>
                  <input id="exp-start" type="date" className="form-input" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-end">End Date <span className="form-hint">(leave blank for Present)</span></label>
                  <input id="exp-end" type="date" className="form-input" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="exp-bullets">Bullet Points <span className="form-hint">(one per line)</span></label>
                <textarea id="exp-bullets" className="form-textarea" rows={5}
                  placeholder={"Built REST APIs with Node.js\nReduced load time by 40%"}
                  value={form.bullets} onChange={e => setForm(p => ({ ...p, bullets: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="exp-logo">Company Logo URL <span className="form-hint">(optional)</span></label>
                <input id="exp-logo" type="url" className="form-input" value={form.logo_url || ''} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} />
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
  meta:      { fontSize: '0.82rem', color: 'var(--accent-primary)', marginTop: '0.15rem' },
};
