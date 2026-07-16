import { useState, useEffect } from 'react';
import { motion }           from 'framer-motion';
import { getSettings }      from '../../api/settingsApi';
import { getSections }      from '../../api/sectionsApi';
import Navbar               from '../../components/layout/Navbar';
import Footer               from '../../components/layout/Footer';
import HeroSection          from './sections/HeroSection';
import SectionRenderer      from './sections/SectionRenderer';

export default function HomePage() {
  const [settings, setSettings] = useState({});
  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getSettings(), getSections()])
      .then(([{ data: s }, { data: sec }]) => {
        const settingsData = s?.settings || {};
        const sectionsData = sec?.sections || [];
        setSettings(settingsData);
        setSections(sectionsData);
        
        // Update SEO Meta Tags dynamically
        if (settingsData.seo_title) {
          document.title = settingsData.seo_title;
        }
        if (settingsData.seo_description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = settingsData.seo_description;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="loader" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}>
      <Navbar settings={settings} />
      <main id="main-content">
        {/* Hero is always rendered — it's driven by global_settings, not a DB section */}
        <HeroSection settings={settings} />

        {/* Dynamic sections created in the admin panel */}
        {sections.map(section => (
          <SectionRenderer key={section.id} section={section} settings={settings} />
        ))}
      </main>
      <Footer settings={settings} />
    </motion.div>
  );
}

