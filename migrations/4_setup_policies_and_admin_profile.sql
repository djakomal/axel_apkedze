-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Allow public read access" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admin insert" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admin to manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admin all" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow self insert" ON public.user_profiles;
DROP POLICY IF EXISTS "users_read_all" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_full_access" ON public.user_profiles;

-- 2. Désactiver RLS temporairement
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Créer le profil admin
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Récupérer l'ID admin
    SELECT id INTO admin_id
    FROM auth.users
    WHERE email = 'tchabikossi0@gmail.com';

    -- Créer le profil
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (id, email, role, full_name)
        VALUES (
            admin_id,
            'tchabikossi0@gmail.com',
            'admin',
            'Administrateur'
        )
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin',
            full_name = 'Administrateur',
            updated_at = CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 4. Configurer les politiques de sécurité pour user_profiles
CREATE POLICY "users_read_all" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "users_update_own" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_full_access" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Configurer les politiques pour la table posters
CREATE POLICY "admin_full_access_posters" ON public.posters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Configurer les politiques de stockage
DO $$
BEGIN
    -- Permettre l'accès au bucket 'posters' pour l'admin
    INSERT INTO storage.policies (name, definition, owner)
    VALUES (
        'admin_posters_policy',
        '(role = ''authenticated'' AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))'::text,
        'authenticated'
    )
    ON CONFLICT (name) DO UPDATE
    SET definition = EXCLUDED.definition;

    -- Permettre l'accès au bucket 'avatars' pour l'admin
    INSERT INTO storage.policies (name, definition, owner)
    VALUES (
        'admin_avatars_policy',
        '(role = ''authenticated'' AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))'::text,
        'authenticated'
    )
    ON CONFLICT (name) DO UPDATE
    SET definition = EXCLUDED.definition;
END $$;

-- 7. Réactiver RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;