import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  userProfile: null,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

const ADMIN_EMAILS = ['kossitegue0@gmail.com', 'tchabikossi0@gmail.com'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fonction pour récupérer le profil utilisateur (mémorisée)
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      console.log('Récupération du profil pour:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      console.log('Profil utilisateur récupéré:', data);
      return data;
    } catch (error) {
      console.error('Erreur fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Vérifier et créer/mettre à jour le profil si nécessaire (optimisé)
  const ensureUserProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    const emailLower = authUser.email?.toLowerCase().trim();
    const shouldBeAdmin = ADMIN_EMAILS.includes(emailLower);

    console.log('ensureUserProfile - Email:', emailLower, 'Should be admin:', shouldBeAdmin);

    // Pour les emails admin, créer un profil temporaire si la base de données a des problèmes
    if (shouldBeAdmin) {
      try {
        // Essayer de récupérer le profil existant
        let profile = await fetchUserProfile(authUser.id);
        
        if (!profile) {
          // Essayer de créer le profil
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: emailLower,
              role: 'admin',
              full_name: 'Administrateur'
            })
            .select()
            .single();

          if (!insertError && newProfile) {
            profile = newProfile;
            console.log('Profil admin créé:', profile);
          } else {
            console.warn('Impossible de créer le profil en base, utilisation d\'un profil temporaire');
            // Créer un profil temporaire pour les admins
            profile = {
              id: authUser.id,
              email: emailLower,
              role: 'admin',
              full_name: 'Administrateur'
            };
          }
        } else if (profile.role !== 'admin') {
          // Essayer de mettre à jour le rôle
          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update({ role: 'admin' })
            .eq('id', authUser.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            profile = updatedProfile;
            console.log('Rôle mis à jour:', profile);
          } else {
            console.warn('Impossible de mettre à jour le rôle, forçage en admin');
            profile.role = 'admin';
          }
        }

        return profile;
      } catch (error) {
        console.error('Erreur avec la base de données, utilisation d\'un profil admin temporaire:', error);
        // Retourner un profil admin temporaire
        return {
          id: authUser.id,
          email: emailLower,
          role: 'admin',
          full_name: 'Administrateur'
        };
      }
    }

    // Pour les utilisateurs normaux
    try {
      let profile = await fetchUserProfile(authUser.id);

      if (!profile) {
        console.log('Création du profil pour:', emailLower);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.id,
            email: emailLower,
            role: 'user',
            full_name: null
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erreur création profil:', insertError);
          return null;
        }

        profile = newProfile;
        console.log('Profil créé:', profile);
      }

      console.log('Profil final:', profile, 'Role:', profile?.role);
      return profile;
    } catch (error) {
      console.error('Erreur fetchUserProfile:', error);
      return null;
    }
  }, [fetchUserProfile]);

  // Mettre à jour l'état avec le profil utilisateur (optimisé)
  const updateUserState = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    setUser(authUser);
    const profile = await ensureUserProfile(authUser);
    setUserProfile(profile);
    
    const adminStatus = profile?.role === 'admin';
    setIsAdmin(adminStatus);
    
    console.log('État mis à jour - User:', authUser.email, 'Is Admin:', adminStatus);
  }, [ensureUserProfile]);

  useEffect(() => {
    // Récupérer la session au chargement
    const initializeAuth = async () => {
      try {
        console.log('Initialisation de l\'authentification...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setLoading(false);
          return;
        }

        console.log('Session récupérée:', session?.user?.email || 'Aucune session');
        
        setSession(session);
        
        if (session?.user) {
          await updateUserState(session.user);
        }
      } catch (error) {
        console.error('Erreur initializeAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'Email:', session?.user?.email);
        
        setSession(session);
        
        if (session?.user) {
          await updateUserState(session.user);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Mise à jour du profil utilisateur (optimisé)
  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Rafraîchir le profil après la mise à jour
      await updateUserState(user);
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { error };
    }
  }, [user, updateUserState]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
  }, []);

  // Fonction refreshProfile mémorisée
  const refreshProfile = useCallback(() => {
    if (user) {
      return updateUserState(user);
    }
    return null;
  }, [user, updateUserState]);

  // Mémoriser la valeur du contexte pour éviter les re-renders
  const value = useMemo(() => ({
    session,
    user,
    userProfile,
    loading,
    isAdmin,
    signIn: (options) => supabase.auth.signInWithPassword(options),
    signOut,
    updateProfile,
    refreshProfile,
  }), [session, user, userProfile, loading, isAdmin, signOut, updateProfile, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};