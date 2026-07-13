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
        if (skillsSec) { setSection(skillsSec); setCats(skillsSec.content?.categories || []); }
        else toast('Skills section not found.', 'error');
      })
      .catch(() => toast('Failed to load skills.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const addCat       = () => setCats(c => [...c, { name: 'New Category', skills: [] }]);
  const removeCat    = (ci) => setCats(c => c.filter((_, i) => i !== ci));
  const updateCatName = (ci, name) => setCats(c => c.map((cat, i) => i === ci ? { ...cat, name } : cat));
  const addSkill     = (ci) => setCats(c => c.map((cat, i) => i === ci ? { ...cat, skills: [...cat.skills, { name: '', level: 80 }] } : cat));
  const removeSkill  = (ci, si) => setCats(c => c.map((cat, i) => i === ci ? { ...cat, skills: cat.skills.filter((_, j) => j !== si) } : cat));
  const updateSkill  = (ci, si, field, val) => setCats(c => c.map((cat, i) => i === ci ? {
    ...cat, skills: cat.skills.map((sk, j) => j === si ? { ...sk, [field]: field === 'level' ? Number(val) : val } : sk),
  } : cat));

  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    try {
      await updateSection(section.id, { content: { categories: cats } });
      toast('Skills saved!', 'success'); load();
    } catch { toast('Failed to save.', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loader" style={{ margin: '3rem auto' }} />;
  if (!section) return (
    <div className="ap-alert"><Icon icon="triangle-exclamation" /> No skills section found. Create one in the Sections Manager first.</div>
  );

  return (
    <div className="ap-page">
      <div className="ap-header">
        <div className="ap-header-text">
          <h1 className="ap-title">Skills <span>Manager</span></h1>
          <p className="ap-sub">Manage your technical skills and proficiency levels.</p>
        </div>
        <div className="ap-header-actions">
          <button className="btn-admin-secondary" onClick={addCat}>
            <Icon icon="plus" /> Add Category
          </button>
          <button className="btn-admin-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Icon icon="spinner" spin /> Saving…</> : <><Icon icon="check" /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="skills-editor-grid">
        {cats.length === 0 ? (
          <div className="ap-empty">
            <Icon icon="bolt" className="ap-empty-icon" />
            <p>No skill categories yet. Click "Add Category" to get started.</p>
          </div>
        ) : cats.map((cat, ci) => (
          <div key={ci} className="skill-cat-card">
            <div className="skill-cat-header">
              <input
                className="skill-cat-name-input"
                value={cat.name}
                onChange={e => updateCatName(ci, e.target.value)}
                placeholder="Category name (e.g. Frontend)" />
              <button className="btn-admin-secondary" onClick={() => addSkill(ci)} style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                <Icon icon="plus" /> Add Skill
              </button>
              <button className="btn-admin-icon btn-admin-icon-del" onClick={() => removeCat(ci)} title="Remove Category">
                <Icon icon="trash" />
              </button>
            </div>

            <div className="skill-cat-body">
              {cat.skills.length === 0 ? (
                <p className="skill-cat-empty">No skills yet — click "Add Skill" above.</p>
              ) : cat.skills.map((sk, si) => (
                <div key={si} className="skill-row">
                  <input
                    className="skill-row-name"
                    value={sk.name}
                    onChange={e => updateSkill(ci, si, 'name', e.target.value)}
                    placeholder="Skill name (e.g. React)" />
                  <input
                    type="range" min="10" max="100" step="5"
                    className="skill-row-range"
                    value={sk.level}
                    onChange={e => updateSkill(ci, si, 'level', e.target.value)} />
                  <span className="skill-row-pct">{sk.level}%</span>
                  <button className="btn-admin-icon btn-admin-icon-del" onClick={() => removeSkill(ci, si)} title="Remove">
                    <Icon icon="xmark" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
