import { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { getAllSections, updateSection } from '../../api/sectionsApi';
import { useToast } from '../../context/ToastContext';

export default function SkillsPage() {
  const toast = useToast();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [cats,    setCats]    = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    getAllSections()
      .then(({ data }) => {
        const skillsSec = data.sections.find(s => s.type === 'skills');
        if (skillsSec) {
          setSection(skillsSec);
          setCats(skillsSec.content?.categories || []);
        } else {
          toast('Skills section not found in DB.', 'error');
        }
      })
      .catch(() => toast('Failed to load skills.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const addCat = () => setCats(c => [...c, { name: 'New Category', skills: [] }]);
  const removeCat = (ci) => setCats(c => c.filter((_, i) => i !== ci));
  const updateCatName = (ci, name) => setCats(c => c.map((cat, i) => i === ci ? { ...cat, name } : cat));

  const addSkill = (ci) => setCats(c => c.map((cat, i) => i === ci ? { ...cat, skills: [...cat.skills, { name: '', level: 80 }] } : cat));
  const removeSkill = (ci, si) => setCats(c => c.map((cat, i) => i === ci ? { ...cat, skills: cat.skills.filter((_, j) => j !== si) } : cat));
  const updateSkill = (ci, si, field, val) => setCats(c => c.map((cat, i) => i === ci ? {
    ...cat,
    skills: cat.skills.map((sk, j) => j === si ? { ...sk, [field]: field === 'level' ? Number(val) : val } : sk),
  } : cat));

  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    try {
      await updateSection(section.id, { content: { categories: cats } });
      toast('Skills saved successfully!', 'success');
      load();
    } catch {
      toast('Failed to save skills.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner spinner-lg" />;

  if (!section) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      No skills section found. Please create a section of type "skills" in the Sections Manager.
    </div>
  );

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.pageTitle}>Skills <span className="gradient-text">Manager</span></h1>
          <p style={styles.pageSub}>Manage your technical skills and expertise levels.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={addCat}>
            <Icon icon="plus" style={{ marginRight: '0.4rem' }} /> Add Category
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Icon icon="spinner" spin /> : <><Icon icon="check" style={{ marginRight: '0.4rem' }} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {cats.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No skill categories added yet. Click "Add Category" to get started.
          </div>
        ) : cats.map((cat, ci) => (
          <div key={ci} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <input
                className="form-input"
                value={cat.name}
                onChange={e => updateCatName(ci, e.target.value)}
                placeholder="Category name (e.g. Frontend)"
                style={{ flex: 1, fontWeight: 700 }}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => addSkill(ci)}>
                <Icon icon="plus" style={{ marginRight: '0.35rem' }} /> Add Skill
              </button>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeCat(ci)} title="Remove Category">
                <Icon icon="trash" />
              </button>
            </div>

            {cat.skills.map((sk, si) => (
              <div key={si} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <input
                  className="form-input"
                  value={sk.name}
                  onChange={e => updateSkill(ci, si, 'name', e.target.value)}
                  placeholder="Skill name (e.g. React)"
                  style={{ flex: 1 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-base)', padding: '0.25rem 1rem', borderRadius: 'var(--r-sm)' }}>
                  <input
                    type="range" min="10" max="100" step="5"
                    value={sk.level}
                    onChange={e => updateSkill(ci, si, 'level', e.target.value)}
                    style={{ width: '120px', accentColor: 'var(--accent-primary)' }}
                  />
                  <span style={{ width: '40px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {sk.level}%
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => removeSkill(ci, si)} title="Remove Skill" style={{ color: '#ef4444' }}>
                  <Icon icon="xmark" />
                </button>
              </div>
            ))}
            {cat.skills.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills yet — click "Add Skill" above.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageTitle:  { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
  pageSub:    { color: 'var(--text-muted)', fontSize: '0.9rem' },
};
