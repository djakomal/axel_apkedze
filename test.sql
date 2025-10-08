-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete new schema with auth
-- Dependencies: None - creating base schema

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM ('admin', 'user');
CREATE TYPE public.poster_status AS ENUM ('draft', 'published', 'archived');

-- 2. Core user profiles table (required for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Posters table
CREATE TABLE public.posters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    image_path TEXT,
    status public.poster_status DEFAULT 'draft'::public.poster_status,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Storage bucket for poster images (PUBLIC - for poster gallery display)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'poster-images',
    'poster-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- 5. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_posters_created_by ON public.posters(created_by);
CREATE INDEX idx_posters_status ON public.posters(status);
CREATE INDEX idx_posters_created_at ON public.posters(created_at DESC);
CREATE INDEX idx_posters_featured ON public.posters(is_featured) WHERE is_featured = true;

-- 6. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- 7. Helper function for admin role checking
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- 8. RLS Policies

-- Pattern 1: Core user table - simple ownership
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read, admin write for posters
CREATE POLICY "public_can_read_published_posters"
ON public.posters
FOR SELECT
TO public
USING (status = 'published'::public.poster_status);

-- Admin full access for posters
CREATE POLICY "admin_full_access_posters"
ON public.posters
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 9. Storage RLS Policies

-- Anyone can view poster images (public bucket)
CREATE POLICY "public_can_view_poster_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'poster-images');

-- Only authenticated users can upload poster images
CREATE POLICY "authenticated_users_upload_poster_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'poster-images');

-- Only admins can delete poster images
CREATE POLICY "admins_manage_poster_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'poster-images' 
    AND public.is_admin_from_auth()
);

-- 10. Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
    );
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Function to update poster view count
CREATE OR REPLACE FUNCTION public.increment_poster_views(poster_uuid UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
UPDATE public.posters 
SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP
WHERE id = poster_uuid AND status = 'published'::public.poster_status;
$$;

-- 12. Complete Mock Data with Authentication
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    poster1_uuid UUID := gen_random_uuid();
    poster2_uuid UUID := gen_random_uuid();
    poster3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@dailyposters.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@dailyposters.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Regular User", "role": "user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample posters
    INSERT INTO public.posters (id, title, description, status, created_by, is_featured, view_count) VALUES
        (poster1_uuid, 'Motivation du Jour', 'Une belle citation inspirante pour commencer la journée avec énergie et optimisme', 'published'::public.poster_status, admin_uuid, true, 127),
        (poster2_uuid, 'Sagesse Ancienne', 'Proverbe traditionnel français plein de sagesse pour guider nos actions quotidiennes', 'published'::public.poster_status, admin_uuid, false, 89),
        (poster3_uuid, 'Inspiration Nature', 'Citation sur la beauté de la nature et limportance de la préserver pour les générations futures', 'draft'::public.poster_status, admin_uuid, false, 0);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 13. Cleanup function for testing
CREATE OR REPLACE FUNCTION public.cleanup_poster_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs to delete
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@dailyposters.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.posters WHERE created_by = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
    
    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
    
    RAISE NOTICE 'Test data cleanup completed successfully';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;
