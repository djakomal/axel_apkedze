import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './ui/UserMenu';

const MainNavigation = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-background border-b border-border px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo et nom du site */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-primary">
            Axel & Apkedze
          </Link>
        </div>

        {/* Navigation principale */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/') ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-primary/5'
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/today"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/today') ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-primary/5'
            }`}
          >
            Aujourd'hui
          </Link>
          <Link
            to="/history"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/history') ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-primary/5'
            }`}
          >
            Historique
          </Link>
          <Link
            to="/about"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/about') ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-primary/5'
            }`}
          >
            À propos
          </Link>
          {isAdmin && (
            <Link
              to="/admin-panel"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin-panel') ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-primary/5'
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* Menu utilisateur */}
        <UserMenu />
      </div>
    </nav>
  );
};

export default MainNavigation;