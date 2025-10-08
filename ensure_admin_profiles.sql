-- Vérifier et créer les profils administrateurs

-- Fonction pour créer ou mettre à jour un profil admin
CREATE OR REPLACE FUNCTION ensure_admin_profile(email_address TEXT)
RETURNS void AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur depuis auth.users
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = email_address;

    IF user_id IS NOT NULL THEN
        -- Mettre à jour ou insérer le profil admin
        INSERT INTO public.user_profiles (id, email, role, full_name)
        VALUES (user_id, email_address, 'admin', 'Administrateur')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin'
        WHERE user_profiles.id = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Assurer que les profils admin existent
SELECT ensure_admin_profile('Kossitegue0@gmail.com');
SELECT ensure_admin_profile('tchabikossi0@gmail.com');

-- Vérifier les profils admin
SELECT * FROM public.user_profiles WHERE role = 'admin';