import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({
  children,
  requiredPermissions = [], // Array of { section, permission }
  redirectTo = '/login',
}) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(
    ({ section, permission }) => hasPermission(section, permission)
  );

  if (!hasAllPermissions) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Higher-order component for conditional rendering based on permissions
export function withPermission(WrappedComponent, requiredPermissions = []) {
  return function WithPermissionComponent(props) {
    const { hasPermission } = useAuth();

    const hasAllPermissions = requiredPermissions.every(
      ({ section, permission }) => hasPermission(section, permission)
    );

    if (!hasAllPermissions) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for conditional rendering within components
export function usePermission(section, permission) {
  const { hasPermission } = useAuth();
  return hasPermission(section, permission);
}
