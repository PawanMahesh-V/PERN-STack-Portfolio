import { useEffect, useState, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projectsApi';
import { getAllSections } from '../../api/sectionsApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

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
  const openEdit   = (p) => { setForm({ ...p, tech_stack: (p.tech_stack || []).join(', ') }); setModal({ mode: 'edit', data: p }); };

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
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Projects <span>Manager</span></h1>
          <p className="ap-sub">Add and manage your portfolio projects.</p>
        </div>
        <button className="btn-admin-primary" id="create-project-btn" onClick={openCreate} disabled={sections.length === 0}>
          <Icon icon="plus" /> Add Project
        </button>
      </div>

      {sections.length === 0 && !loading && (
        <div className="ap-alert">
          <Icon icon="triangle-exclamation" />
          Create a section of type <code>projects</code> first in the Sections manager.
        </div>
      )}

      <div className="ap-card">
        {loading ? <div className="loader" style={{ margin: '3rem auto' }} /> : (
          <div className="ap-table-wrap">
            {projects.length === 0 ? (
              <div className="ap-empty">
                <Icon icon="folder-open" className="ap-empty-icon" />
                <p>No projects yet. Click "Add Project" to get started.</p>
              </div>
            ) : (
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Tech Stack</th>
                    <th>Links</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.image_url && <img src={p.image_url} alt={p.title} className="td-thumb" />}
                          <div>
                            <div className="td-title">{p.title}</div>
                            {p.description && <div className="td-meta">{p.description.substring(0, 60)}…</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {(p.tech_stack || []).slice(0,4).map(t => (
                            <span key={t} className="ap-badge ap-badge-gray">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="ap-badge ap-badge-blue"><Icon icon={['fab','github']} /> GitHub</a>}
                          {p.live_url   && <a href={p.live_url}   target="_blank" rel="noopener noreferrer" className="ap-badge ap-badge-green"><Icon icon="arrow-up-right-from-square" /> Live</a>}
                        </div>
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn-admin-icon btn-admin-icon-edit" onClick={() => openEdit(p)} title="Edit"><Icon icon="pencil" /></button>
                          <button className="btn-admin-icon btn-admin-icon-del"  onClick={() => handleDelete(p.id)} title="Delete"><Icon icon="trash" /></button>
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

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} role="dialog">
              <div className="modal-header">
                <div className="modal-title"><Icon icon={modal.mode === 'create' ? 'plus' : 'pencil'} />{modal.mode === 'create' ? 'New Project' : 'Edit Project'}</div>
                <button className="modal-close" onClick={() => setModal(null)}><Icon icon="xmark" /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-section">Section</label>
                    <select id="proj-section" className="form-input" value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value }))}>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-title">Title *</label>
                    <input id="proj-title" className="form-input" type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="My Awesome Project" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-desc">Description</label>
                    <textarea id="proj-desc" className="form-input" rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief project description…" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-tech">Tech Stack <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(comma-separated)</span></label>
                    <input id="proj-tech" className="form-input" type="text" placeholder="React, Node.js, PostgreSQL" value={form.tech_stack} onChange={e => setForm(p => ({ ...p, tech_stack: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="proj-github">GitHub URL</label>
                      <input id="proj-github" className="form-input" type="url" value={form.github_url || ''} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} placeholder="https://github.com/…" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="proj-live">Live URL</label>
                      <input id="proj-live" className="form-input" type="url" value={form.live_url || ''} onChange={e => setForm(p => ({ ...p, live_url: e.target.value }))} placeholder="https://…" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="proj-img">Image URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                    <input id="proj-img" className="form-input" type="url" value={form.image_url || ''} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://…/image.png" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-admin-secondary" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-admin-primary" disabled={saving}>
                    {saving ? <><Icon icon="spinner" spin /> Saving…</> : modal.mode === 'create' ? 'Create Project' : 'Save Changes'}
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
