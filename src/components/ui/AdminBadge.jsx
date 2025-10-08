import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminBadge = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
      Admin
    </span>
  );
};

export default AdminBadge;