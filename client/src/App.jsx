import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRouter         from './router/AppRouter';
import './index.css';
function CyberGridBackground() {
  return (
    <div className="cyber-grid-bg">
      <div className="cyber-sun" />
      <div className="cyber-grid" />
      <div className="cyber-vignette" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CyberGridBackground />
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}
