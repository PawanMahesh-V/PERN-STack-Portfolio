import { useState, useEffect } from 'react';
import { motion }           from 'framer-motion';
import { getResumeData }    from '../../api/resumeApi';
import Navbar               from '../../components/layout/Navbar';
import Footer               from '../../components/layout/Footer';
import HeroSection          from './sections/HeroSection';
import SectionRenderer      from './sections/SectionRenderer';

export default function HomePage() {
  const [resumeData, setResumeData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getResumeData()
      .then(({ data }) => {
        setResumeData(data);
        
        // Update SEO Meta Tags dynamically
        if (data.settings?.seo_title) {
          document.title = data.settings.seo_title;
        }
        if (data.settings?.seo_description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = data.settings.seo_description;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !resumeData) return (
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
      <Navbar settings={resumeData.settings} />
      <main id="main-content">
        {/* Hero is always rendered — it's driven by global_settings, not a DB section */}
        <HeroSection settings={resumeData.settings} />

        {/* Dynamic sections created in the admin panel */}
        {(resumeData.sections || []).map(section => (
          <SectionRenderer key={section.id} section={section} settings={resumeData.settings} resumeData={resumeData} />
        ))}
      </main>
      <Footer settings={resumeData.settings} />
    </motion.div>
  );
}

