import React, { useEffect, useState } from 'react';

const ConfigGate = ({ children }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [hasImagesDescriptions, setHasImagesDescriptions] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);

  useEffect(() => {
    // Prefill from localStorage if present
    try {
      const lsUrl = window.localStorage?.getItem('VITE_SUPABASE_URL') || '';
      const lsKey = window.localStorage?.getItem('VITE_SUPABASE_ANON_KEY') || '';
      const lsHas = window.localStorage?.getItem('HAS_IMAGES_DESCRIPTIONS') || '';
      if (lsUrl) setUrl(lsUrl);
      if (lsKey) setKey(lsKey);
      if (lsHas) setHasImagesDescriptions(lsHas);
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      if (!url?.startsWith('http')) {
        setError('URL Supabase invalide');
        return;
      }
      if (!key || key.length < 20) {
        setError('Clé anon invalide');
        return;
      }
      window.localStorage.setItem('VITE_SUPABASE_URL', url.trim());
      window.localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
      // Permet aussi la config globale
      window.__APP_CONFIG__ = {
        VITE_SUPABASE_URL: url.trim(),
        VITE_SUPABASE_ANON_KEY: key.trim(),
        HAS_IMAGES_DESCRIPTIONS: hasImagesDescriptions.trim()
      };
      window.localStorage.setItem('HAS_IMAGES_DESCRIPTIONS', hasImagesDescriptions.trim());
      window.location.reload();
    } catch (e) {
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleDownloadEnv = () => {
    try {
      setError('');
      if (!url || !key) {
        setError('Renseignez URL et clé avant de télécharger le .env');
        return;
      }
      const content = `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${key}\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '.env';
      a.click();
      URL.revokeObjectURL(a.href);
      setDownloadReady(true);
    } catch {
      setError('Impossible de générer le fichier .env');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-heading-semibold text-text-primary mb-4">Configuration Supabase requise</h1>
        <p className="text-sm text-text-secondary mb-6">Renseignez l'URL du projet et la clé anon.</p>
        {error && <div className="text-destructive text-sm mb-3">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">VITE_SUPABASE_URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" className="w-full border border-border rounded px-3 py-2 bg-background text-text-primary" />
          </div>
          <div>
            <label className="block text-sm mb-1">VITE_SUPABASE_ANON_KEY</label>
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="eyJ..." className="w-full border border-border rounded px-3 py-2 bg-background text-text-primary" />
          </div>
          <div>
            <label className="block text-sm mb-1">HAS_IMAGES_DESCRIPTIONS (true/false)</label>
            <input value={hasImagesDescriptions} onChange={(e) => setHasImagesDescriptions(e.target.value)} placeholder="true ou false" className="w-full border border-border rounded px-3 py-2 bg-background text-text-primary" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={handleSave} className="w-full bg-primary text-white rounded px-4 py-2">Sauvegarder et recharger</button>
            <button type="button" onClick={handleDownloadEnv} className="w-full border border-border rounded px-4 py-2">Télécharger .env</button>
            {downloadReady && (
              <p className="text-xs text-text-secondary">Placez le fichier .env à la racine du projet puis redémarrez.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigGate;

