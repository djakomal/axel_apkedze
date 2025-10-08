import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification du mot de passe
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;

      // Redirection après inscription réussie
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-text-primary">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Inscrivez-vous pour commencer
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
              id="fullName"
              name="fullName"
              type="text"
              label="Nom complet"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Votre nom complet"
            />

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

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmer le mot de passe"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Création du compte...' : 'Créer un compte'}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;