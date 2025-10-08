-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "admin_full_access_posters" ON public.posters;
DROP POLICY IF EXISTS "public_read_posters" ON public.posters;

-- 2. Créer les nouvelles politiques
-- Lecture publique des posters
CREATE POLICY "public_read_posters" ON public.posters
    FOR SELECT USING (true);

-- Accès complet pour les administrateurs
CREATE POLICY "admin_full_access_posters" ON public.posters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Vérifier que la RLS est activée
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;