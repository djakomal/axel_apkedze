import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const LogoutButton = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // La redirection sera gérée automatiquement par le PrivateRoute
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error.message);
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white"
    >
      Déconnexion
    </Button>
  );
};

export default LogoutButton;