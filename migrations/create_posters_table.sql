-- Créer la table posters si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.posters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    file_path TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activer RLS sur la table posters
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- Créer un trigger pour updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.posters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();