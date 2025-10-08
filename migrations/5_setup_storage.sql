-- 1. Créer les buckets de stockage s'ils n'existent pas
INSERT INTO storage.buckets (id, name)
VALUES ('posters', 'posters')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

-- 2. Configurer les politiques de stockage pour les admins
INSERT INTO storage.policies (name, definition, owner, bucket_id)
VALUES (
    'admin_posters_policy',
    '(role = ''authenticated'' AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))',
    'authenticated',
    'posters'
)
ON CONFLICT (name) DO UPDATE
SET definition = EXCLUDED.definition;

INSERT INTO storage.policies (name, definition, owner, bucket_id)
VALUES (
    'admin_avatars_policy',
    '(role = ''authenticated'' AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ''admin''))',
    'authenticated',
    'avatars'
)
ON CONFLICT (name) DO UPDATE
SET definition = EXCLUDED.definition;

-- 3. Ajouter des politiques de lecture publique pour les images
INSERT INTO storage.policies (name, definition, owner, bucket_id)
VALUES (
    'public_posters_read',
    'true',
    'public',
    'posters'
)
ON CONFLICT (name) DO UPDATE
SET definition = EXCLUDED.definition;

INSERT INTO storage.policies (name, definition, owner, bucket_id)
VALUES (
    'public_avatars_read',
    'true',
    'public',
    'avatars'
)
ON CONFLICT (name) DO UPDATE
SET definition = EXCLUDED.definition;