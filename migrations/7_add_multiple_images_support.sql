-- Migration pour ajouter le support de plusieurs images par poster
-- Ajouter les colonnes pour stocker les URLs et chemins de fichiers multiples

-- Ajouter les nouvelles colonnes
ALTER TABLE public.posters 
ADD COLUMN IF NOT EXISTS images TEXT[], -- Array d'URLs d'images
ADD COLUMN IF NOT EXISTS file_paths TEXT[]; -- Array de chemins de fichiers

-- Mettre à jour les enregistrements existants pour migrer les données
UPDATE public.posters 
SET 
    images = ARRAY[image_url] WHERE image_url IS NOT NULL AND images IS NULL,
    file_paths = ARRAY[file_path] WHERE file_path IS NOT NULL AND file_paths IS NULL;

-- Créer un index pour les recherches sur les images
CREATE INDEX IF NOT EXISTS idx_posters_images ON public.posters USING GIN (images);

-- Commentaires pour documentation
COMMENT ON COLUMN public.posters.images IS 'Array des URLs des images du poster (jusqu''à 4)';
COMMENT ON COLUMN public.posters.file_paths IS 'Array des chemins de stockage des images du poster';
