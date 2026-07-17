import AboutSection        from './AboutSection';
import ExperienceSection   from './ExperienceSection';
import ProjectsSection     from './ProjectsSection';
import CertificatesSection from './CertificatesSection';
import ContactSection      from './ContactSection';
import SkillsSection       from './SkillsSection';

const MAP = {
  about:        AboutSection,
  experience:   ExperienceSection,
  projects:     ProjectsSection,
  certificates: CertificatesSection,
  contact:      ContactSection,
  skills:       SkillsSection,
};

export default function SectionRenderer({ section, settings, resumeData }) {
  if (!section.is_visible) return null;
  const Component = MAP[section.type];
  if (!Component) return null;
  return <Component section={section} settings={settings} resumeData={resumeData} />;
}
