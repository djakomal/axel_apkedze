import React, { memo, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../context/AuthContext';

const BottomTabNavigation = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const navigationItems = useMemo(() => [
    {
      label: 'Accueil',
      path: '/home',
      icon: 'Home',
      tooltip: 'Page d\'accueil'
    },
    {
      label: 'Aujourd\'hui',
      path: '/today',
      icon: 'Calendar',
      tooltip: 'Posters du jour',
      requireAuth: true
    },
    {
      label: 'Historique',
      path: '/history',
      icon: 'Clock',
      tooltip: 'Historique',
      requireAuth: true
    }
  ], []);

  const getProfileItems = useCallback(() => {
    if (user) {
      return [
        {
          label: 'Profil',
          path: '/profile',
          icon: 'User',
          tooltip: 'Mon profil'
        },
        ...(isAdmin ? [{
          label: 'Admin',
          path: '/admin-panel',
          icon: 'Settings',
          tooltip: 'Administration'
        }] : [])
      ];
    } else {
      return [{
        label: 'Connexion',
        path: '/login',
        icon: 'LogIn',
        tooltip: 'Se connecter'
      }];
    }
  }, [user, isAdmin]);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const isActive = useCallback((path) => {
    return location?.pathname === path;
  }, [location?.pathname]);

  const allItems = useMemo(() => [...navigationItems, ...getProfileItems()], [navigationItems, getProfileItems]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-navigation bg-background border-t border-border floating-navigation">
      <div className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {allItems.map((item, index) => (
          <button
            key={item.path || index}
            onClick={() => item.action ? item.action() : handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-gentle min-w-0 flex-1 ${
              isActive(item.path)
                ? 'text-primary bg-primary/10' 
                : 'text-text-secondary hover:text-text-primary hover:bg-muted/50'
            } ${item.requireAuth && !user ? 'opacity-50 pointer-events-none' : ''}`}
            title={item.tooltip}
            aria-label={item.tooltip}
            disabled={item.requireAuth && !user}
          >
            <Icon 
              name={item.icon} 
              size={20} 
              className={`mb-1 transition-colors duration-200 ${
                isActive(item.path) ? 'text-primary' : 'text-current'
              }`}
            />
            <span className={`text-xs font-caption-normal leading-tight transition-colors duration-200 ${
              isActive(item.path) ? 'text-primary font-caption-medium' : 'text-current'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
});

BottomTabNavigation.displayName = 'BottomTabNavigation';

export default BottomTabNavigation;