import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SocialLogin from '../../components/auth/SocialLogin';

const LoginPage = memo(() => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirection automatique si l'utilisateur est déjà connecté (optimisé)
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      setLoading(true); // On montre le loader pendant la redirection
      // Utiliser setTimeout pour éviter les blocages de rendu
      const redirectTimer = setTimeout(() => {
        if (isAdmin) {
          navigate('/admin-panel', { replace: true });
        } else {
          navigate('/today', { replace: true });
        }
      }, 100); // Petit délai pour permettre le rendu du loader
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, isAdmin, authLoading, userProfile, navigate]);
  

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Tentative de connexion avec:', formData.email);
      
      // Connexion via Supabase
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      console.log('Connexion réussie pour:', authData.user.email);
      
      // Attendre que l'AuthContext se mette à jour complètement
      // La redirection se fera automatiquement via l'useEffect qui surveille userProfile
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-text-primary">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Adresse email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Mot de passe"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Votre mot de passe"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80">
              S'inscrire
            </Link>
          </p>
        </form>

        <SocialLogin />
      </div>
    </div>
  );
});

LoginPage.displayName = 'LoginPage';

export default LoginPage;