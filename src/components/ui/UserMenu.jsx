import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar et nom */}
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {user.user_metadata?.full_name || user.email}
          </span>
          {isAdmin && (
            <span className="text-xs text-primary">Administrateur</span>
          )}
        </div>
      </div>

      {/* Menu dropdown */}
      <div className="flex gap-2">
        <Button
          onClick={() => navigate('/profile')}
          variant="outline"
          size="sm"
        >
          Profil
        </Button>
        <Button
          onClick={handleLogout}
          variant="destructive"
          size="sm"
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default UserMenu;