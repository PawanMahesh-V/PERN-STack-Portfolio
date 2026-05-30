import './index.css';
import { AuthProvider }       from './context/AuthContext';
import { ToastProvider }      from './context/ToastContext';
import { ThemeProvider }      from './context/ThemeContext';
import AppRouter              from './router/AppRouter';
import ScrollToTop            from './components/ui/ScrollToTop';
import ScrollProgressBar      from './components/ui/ScrollProgressBar';
import CustomCursor           from './components/ui/CustomCursor';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CustomCursor />
          <ScrollProgressBar />
          <AppRouter />
          <ScrollToTop />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
