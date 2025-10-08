-- Ajouter les descriptions par image (alignées à images[])
ALTER TABLE public.posters
  ADD COLUMN IF NOT EXISTS images_descriptions TEXT[];

-- Optionnel: définir une longueur attendue par trigger/contrainte (non bloquant ici)

