import React, { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const AdminRoute = memo(({ children }) => {
  const { user, userProfile, loading, isAdmin } = useAuth();

  console.log('AdminRoute - État:', {
    user: user?.email,
    profile: userProfile,
    isAdmin,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Vérification des droits d'administration..." />
      </div>
    );
  }

  if (!user) {
    console.log('AdminRoute - Pas d\'utilisateur, redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('AdminRoute - Utilisateur non admin, redirection vers /today');
    return <Navigate to="/today" replace />;
  }

  console.log('AdminRoute - Accès autorisé à l\'admin panel');
  return children;
});

AdminRoute.displayName = 'AdminRoute';

export default AdminRoute;