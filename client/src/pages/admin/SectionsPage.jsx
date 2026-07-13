import { useEffect, useState, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getAllSections, createSection, updateSection, deleteSection, reorderSections } from '../../api/sectionsApi';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';

const TYPES = ['about','experience','projects','certificates','skills','contact'];

function SortableRow({ s, i, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="sections-row">
      <div className="sections-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <Icon icon="grip-vertical" />
      </div>
      <span className="sections-row-order">{i + 1}</span>
      <div className="sections-row-info">
        <div className="sections-row-title">{s.title}</div>
        <div className="sections-row-type">{s.type}</div>
      </div>
      <div className="sections-row-actions">
        <button
          className={`ap-badge ${s.is_visible ? 'ap-badge-green' : 'ap-badge-gray'}`}
          style={{ cursor: 'pointer', border: 'none' }}
          onClick={() => onToggle(s)}>
          <Icon icon={s.is_visible ? 'eye' : 'eye-slash'} />
          {s.is_visible ? 'Visible' : 'Hidden'}
        </button>
        <button className="btn-admin-icon btn-admin-icon-edit" onClick={() => onEdit(s)} title="Edit"><Icon icon="pencil" /></button>
        <button className="btn-admin-icon btn-admin-icon-del" onClick={() => onDelete(s.id)} title="Delete"><Icon icon="trash" /></button>
      </div>
    </div>
  );
}

export default function SectionsPage() {
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({ title: '', type: 'projects', is_visible: true });
  const [saving,   setSaving]   = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(() => {
    setLoading(true);
    getAllSections()
      .then(({ data }) => setSections(data.sections))
      .catch(() => toast('Failed to load.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const openCreate = () => { setForm({ title: '', type: 'projects', is_visible: true }); setModal({ mode: 'create' }); };
  const openEdit   = (s) => { setForm({ title: s.title, type: s.type, is_visible: s.is_visible }); setModal({ mode: 'edit', data: s }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal.mode === 'create') { await createSection({ ...form, display_order: sections.length }); toast('Section created!', 'success'); }
      else { await updateSection(modal.data.id, form); toast('Updated!', 'success'); }
      setModal(null); load();
    } catch (err) { toast(err.response?.data?.error || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this section and all its content?')) return;
    try { await deleteSection(id); toast('Deleted.', 'success'); load(); }
    catch { toast('Delete failed.', 'error'); }
  };

  const handleToggle = async (s) => {
    try {
      await updateSection(s.id, { is_visible: !s.is_visible });
      setSections(prev => prev.map(p => p.id === s.id ? { ...p, is_visible: !p.is_visible } : p));
    } catch { toast('Toggle failed.', 'error'); }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered.map((s, i) => ({ ...s, display_order: i })));
    try { await reorderSections(reordered.map((s, i) => ({ id: s.id, display_order: i }))); }
    catch { toast('Reorder failed.', 'error'); load(); }
  };

  return (
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Sections <span>Manager</span></h1>
          <p className="ap-sub">Drag to reorder, toggle visibility, or edit section content.</p>
        </div>
        <button className="btn-admin-primary" id="create-section-btn" onClick={openCreate}>
          <Icon icon="plus" /> New Section
        </button>
      </div>

      <div className="ap-card">
        {loading ? <div className="loader" style={{ margin: '3rem auto' }} /> : (
          sections.length === 0 ? (
            <div className="ap-empty">
              <Icon icon="layer-group" className="ap-empty-icon" />
              <p>No sections yet. Create your first one!</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((s, i) => (
                  <SortableRow key={s.id} s={s} i={i} total={sections.length} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </SortableContext>
            </DndContext>
          )
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} role="dialog">
              <div className="modal-header">
                <div className="modal-title">
                  <Icon icon={modal.mode === 'create' ? 'plus' : 'pencil'} />
                  {modal.mode === 'create' ? 'New Section' : 'Edit Section'}
                </div>
                <button className="modal-close" onClick={() => setModal(null)}><Icon icon="xmark" /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="sec-title">Title</label>
                    <input id="sec-title" className="form-input" type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. My Projects" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sec-type">Type</label>
                    <select id="sec-type" className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <input id="sec-visible" type="checkbox" checked={form.is_visible} onChange={e => setForm(p => ({ ...p, is_visible: e.target.checked }))} />
                    <Icon icon="eye" /> Visible on public portfolio
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-admin-secondary" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-admin-primary" disabled={saving}>
                    {saving ? <><Icon icon="spinner" spin /> Saving…</> : modal.mode === 'create' ? 'Create Section' : 'Save Changes'}
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
