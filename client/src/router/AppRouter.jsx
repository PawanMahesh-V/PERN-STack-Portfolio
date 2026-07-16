import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public (eager — users always see these)
import HomePage   from '../pages/public/HomePage';
import LoginPage  from '../pages/LoginPage';

// Admin (lazy — only load when admin logs in)
const AdminLayout        = lazy(() => import('../pages/admin/AdminLayout'));
const DashboardHome      = lazy(() => import('../pages/admin/DashboardHome'));
const GlobalSettingsPage = lazy(() => import('../pages/admin/GlobalSettingsPage'));
const SectionsPage       = lazy(() => import('../pages/admin/SectionsPage'));
const ProjectsPage       = lazy(() => import('../pages/admin/ProjectsPage'));
const CertificatesPage   = lazy(() => import('../pages/admin/CertificatesPage'));
const ExperiencePage     = lazy(() => import('../pages/admin/ExperiencePage'));
const SkillsPage         = lazy(() => import('../pages/admin/SkillsPage'));
const MessagesPage       = lazy(() => import('../pages/admin/MessagesPage'));

const AdminFallback = (
  <div>
    <div />
  </div>
);

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only track public visits, ignore admin dashboard routes
    if (!location.pathname.startsWith('/phantom')) {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      fetch(`${baseUrl}/analytics/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname }),
      }).catch(() => {});
    }
  }, [location]);

  return null;
}

import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public ── */}
        <Route path="/"        element={<HomePage />} />
        <Route path="/phantom" element={<LoginPage />} />

        {/* ── Admin — lazy loaded, protected ── */}
        <Route
          path="/phantom/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={AdminFallback}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index               element={<Suspense fallback={null}><DashboardHome /></Suspense>} />
          <Route path="settings"     element={<Suspense fallback={null}><GlobalSettingsPage /></Suspense>} />
          <Route path="sections"     element={<Suspense fallback={null}><SectionsPage /></Suspense>} />
          <Route path="projects"     element={<Suspense fallback={null}><ProjectsPage /></Suspense>} />
          <Route path="certificates" element={<Suspense fallback={null}><CertificatesPage /></Suspense>} />
          <Route path="experience"   element={<Suspense fallback={null}><ExperiencePage /></Suspense>} />
          <Route path="skills"       element={<Suspense fallback={null}><SkillsPage /></Suspense>} />
          <Route path="messages"     element={<Suspense fallback={null}><MessagesPage /></Suspense>} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

import { useState } from 'react';
import IntroScreen from '../components/layout/IntroScreen';

export default function AppRouter() {
  // Temporarily set to always true so you can see it on every refresh
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      {showIntro && (
        <IntroScreen 
          onComplete={() => {
            setShowIntro(false);
          }} 
        />
      )}
      <RouteTracker />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
