import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Shows a full-screen spinner while JWT is being verified on mount
function AuthSpinner() {
  return (
    <div>
      <div />
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;

  if (!isAuth) {
    // Preserve the attempted URL so we can redirect after login
    return <Navigate to="/phantom" state={{ from: location }} replace />;
  }

  return children;
}
