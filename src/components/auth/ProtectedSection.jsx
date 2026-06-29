import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function ProtectedSection({ section, children }) {
  const { isAuthenticated, loading, hasAnyPrivilege, isAdmin } =
    useContext(AuthContext);

  if (loading) return null; // or a spinner

  // super-admins can access everything
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return children;

  // if section is not provided allow
  if (!section) return children;

  if (!hasAnyPrivilege(section)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
