-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "users_read_all" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_full_access" ON public.user_profiles;
DROP POLICY IF EXISTS "auto_assign_admin" ON public.user_profiles;

-- Activer RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Créer une fonction pour gérer l'attribution automatique du rôle admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'tchabikossi0@gmail.com' THEN
        NEW.role := 'admin';
    ELSE
        NEW.role := 'user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS set_user_role ON public.user_profiles;
CREATE TRIGGER set_user_role
    BEFORE INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Créer les politiques de sécurité
CREATE POLICY "users_read_all" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "users_update_own" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique spéciale pour l'admin
CREATE POLICY "admin_full_access" ON public.user_profiles
    FOR ALL USING (
        (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin'))
    );