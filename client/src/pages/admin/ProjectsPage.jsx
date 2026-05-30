import { useEffect, useState, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projectsApi';
import { getAllSections } from '../../api/sectionsApi';
import { useToast } from '../../context/ToastContext';

const EMPTY = { section_id: '', title: '', description: '', tech_stack: '', github_url: '', live_url: '', image_url: '', display_order: 0 };

export default function ProjectsPage() {
  const toast = useToast();
  const [projects,  setProjects]  = useState([]);
  const [sections,  setSections]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(() => {
    Promise.all([getProjects(), getAllSections()])
      .then(([{ data: p }, { data: s }]) => {
        setProjects(p.projects);
        setSections(s.sections.filter(s => s.type === 'projects'));
      })
      .catch(() => toast('Failed to load.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const openCreate = () => { setForm({ ...EMPTY, section_id: sections[0]?.id || '' }); setModal({ mode: 'create' }); };
  const openEdit   = (p)  => { setForm({ ...p, tech_stack: (p.tech_stack || []).join(', ') }); setModal({ mode: 'edit', data: p }); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tech_stack: form.tech_stack ? form.tech_stack.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (modal.mode === 'create') { await createProject(payload); toast('Project created!', 'success'); }
      else { await updateProject(modal.data.id, payload); toast('Project updated!', 'success'); }
      setModal(null); load();
    } catch (err) { toast(err.response?.data?.error || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await deleteProject(id); toast('Deleted.', 'success'); load(); }
    catch { toast('Delete failed.', 'error'); }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.pageTitle}>Projects <span className="gradient-text">Manager</span></h1>
          <p style={styles.pageSub}>Add and manage your portfolio projects.</p>
        </div>
        <button id="create-project-btn" onClick={openCreate} className="btn btn-primary" disabled={sections.length === 0}>+ Add Project</button>
      </div>

      {sections.length === 0 && !loading && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Create a section of type <code>projects</code> first in the Sections manager.
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {projects.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No projects yet.</div>
          ) : projects.map((p, i) => (
            <div key={p.id} style={{ ...styles.row, borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
              {p.image_url && <img src={p.image_url} alt={p.title} style={styles.thumb} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{p.title}</p>
                <p style={styles.meta}>{(p.tech_stack || []).join(' · ') || 'No tech stack'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={styles.link}>GitHub ↗</a>}
                  {p.live_url   && <a href={p.live_url}   target="_blank" rel="noopener noreferrer" style={styles.link}>Live ↗</a>}
                </div>
              </div>
              <button onClick={() => openEdit(p)}   className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm btn-icon" aria-label="Delete">✕</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{modal.mode === 'create' ? 'New Project' : 'Edit Project'}</h2>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="proj-section">Section</label>
                <select id="proj-section" className="form-select" value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value }))}>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="proj-title">Title *</label>
                <input id="proj-title" type="text" className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="proj-desc">Description</label>
                <textarea id="proj-desc" className="form-textarea" rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="proj-tech">Tech Stack <span className="form-hint">(comma-separated)</span></label>
                <input id="proj-tech" type="text" className="form-input" placeholder="React, Node.js, PostgreSQL" value={form.tech_stack} onChange={e => setForm(p => ({ ...p, tech_stack: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-github">GitHub URL</label>
                  <input id="proj-github" type="url" className="form-input" value={form.github_url || ''} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-live">Live URL <span className="form-hint">(optional)</span></label>
                  <input id="proj-live" type="url" className="form-input" value={form.live_url || ''} onChange={e => setForm(p => ({ ...p, live_url: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="proj-img">Image URL <span className="form-hint">(optional)</span></label>
                <input id="proj-img" type="url" className="form-input" value={form.image_url || ''} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '…' : modal.mode === 'create' ? 'Create' : 'Save'}</button>
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
  thumb:     { width: '56px', height: '40px', objectFit: 'cover', borderRadius: 'var(--r-sm)', flexShrink: 0 },
  meta:      { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' },
  link:      { fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none' },
};
