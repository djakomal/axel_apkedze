import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      console.log('🔄 Chargement du profil pour:', user.email);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur DB:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Profil trouvé en DB:', data);
        setProfile({
          full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || user.user_metadata?.avatar_url || '',
        });
      } else {
        console.log('⚠️ Pas de profil en DB, utilisation des données auth');
        setProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement du profil:', error);
      // Fallback avec les données d'auth
      setProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setMessage({ type: '', text: '' });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Déconnexion réussie');
      // Forcer la redirection vers la page de connexion
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la déconnexion' });
    }
  };

  const handleAvatarChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Upload de l'avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Mise à jour du profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: `https://<ton-projet>.supabase.co/storage/v1/object/public/avatars/${filePath}`,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'Avatar mis à jour avec succès!' });
      loadProfile();
    } catch (error) {
      console.error('Erreur lors du changement d\'avatar:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de l\'avatar' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement du profil...</p>
          <p className="text-xs text-muted-foreground mt-2">Récupération des données utilisateur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <p className="text-text-secondary mt-2">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Photo de profil
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    {profile.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar-input').click()}
              >
                Changer l'avatar
              </Button>
            </div>
          </div>

          {/* Informations du profil */}
          <div className="space-y-4">
            <Input
              label="Nom complet"
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              value={profile.email}
              disabled
              help="L'email ne peut pas être modifié"
            />

            {/* Bouton de déconnexion */}
            <div className="pt-6">
              <Button
                type="button"
                onClick={handleSignOut}
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                Se déconnecter
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;