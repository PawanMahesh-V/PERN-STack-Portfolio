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

const TYPES = ['about','experience','projects','certificates','skills','contact'];

// ── Sortable row ───────────────────────────────────────────────
function SortableRow({ s, i, total, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.row,
        borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent',
      }}
    >
      {/* Drag handle */}
      <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <Icon icon="grip-vertical" />
      </div>

      <span style={styles.orderNum}>{i + 1}</span>

      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.title}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.type}</p>
      </div>

      <button onClick={() => onToggle(s)} className={`btn btn-sm ${s.is_visible ? 'btn-outline' : 'btn-ghost'}`}>
        <Icon icon={s.is_visible ? 'eye' : 'eye-slash'} style={{ marginRight: '0.4rem' }} />
        {s.is_visible ? 'Visible' : 'Hidden'}
      </button>

      <button onClick={() => onEdit(s)} className="btn btn-ghost btn-sm">
        <Icon icon="pencil" style={{ marginRight: '0.4rem' }} /> Edit
      </button>

      <button onClick={() => onDelete(s.id)} className="btn btn-danger btn-sm btn-icon">
        <Icon icon="trash" />
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
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
      .catch(() => toast('Failed to load sections.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const openCreate = () => { setForm({ title: '', type: 'projects', is_visible: true }); setModal({ mode: 'create' }); };
  const openEdit   = (s)  => { setForm({ title: s.title, type: s.type, is_visible: s.is_visible }); setModal({ mode: 'edit', data: s }); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') { await createSection({ ...form, display_order: sections.length }); toast('Section created!', 'success'); }
      else { await updateSection(modal.data.id, form); toast('Section updated!', 'success'); }
      setModal(null); load();
    } catch (err) { toast(err.response?.data?.error || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this section and all its content?')) return;
    try { await deleteSection(id); toast('Section deleted.', 'success'); load(); }
    catch { toast('Delete failed.', 'error'); }
  };

  const handleToggle = async (s) => {
    try {
      await updateSection(s.id, { is_visible: !s.is_visible });
      setSections(prev => prev.map(p => p.id === s.id ? { ...p, is_visible: !p.is_visible } : p));
    } catch { toast('Toggle failed.', 'error'); }
  };


  // ── Drag-and-Drop ─────────────────────────────────────────────
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered.map((s, i) => ({ ...s, display_order: i })));

    try {
      await reorderSections(reordered.map((s, i) => ({ id: s.id, display_order: i })));
    } catch { toast('Reorder failed.', 'error'); load(); }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.pageTitle}>Sections <span className="gradient-text">Manager</span></h1>
          <p style={styles.pageSub}>Drag to reorder, toggle visibility, or edit section content.</p>
        </div>
        <button id="create-section-btn" onClick={openCreate} className="btn btn-primary">
          <Icon icon="plus" style={{ marginRight: '0.4rem' }} /> New Section
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {sections.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sections yet.</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((s, i) => (
                  <div key={s.id}>
                    <SortableRow
                      s={s} i={i} total={sections.length}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Section create/edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2 className="modal-title">
                <Icon icon={modal.mode === 'create' ? 'plus' : 'pencil'} style={{ marginRight: '0.5rem' }} />
                {modal.mode === 'create' ? 'New Section' : 'Edit Section'}
              </h2>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon"><Icon icon="xmark" /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="sec-title">Title</label>
                <input id="sec-title" type="text" className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sec-type">Type</label>
                <select id="sec-type" className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input id="sec-visible" type="checkbox" checked={form.is_visible} onChange={e => setForm(p => ({ ...p, is_visible: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }} />
                <label htmlFor="sec-visible" className="form-label" style={{ margin: 0 }}>
                  <Icon icon="eye" style={{ marginRight: '0.4rem' }} /> Visible on public portfolio
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Icon icon="spinner" spin /> : modal.mode === 'create' ? 'Create Section' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

const styles = {
  pageTitle:  { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
  pageSub:    { color: 'var(--text-muted)', fontSize: '0.9rem' },
  row:        { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', transition: 'background 0.15s ease' },
  orderNum:   { width: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 },
};
