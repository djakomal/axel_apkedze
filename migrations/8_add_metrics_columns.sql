-- Ajouter des compteurs de métriques sur les posters
ALTER TABLE public.posters
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Indices pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_posters_views_count ON public.posters(views_count);
CREATE INDEX IF NOT EXISTS idx_posters_downloads_count ON public.posters(downloads_count);
CREATE INDEX IF NOT EXISTS idx_posters_shares_count ON public.posters(shares_count);

