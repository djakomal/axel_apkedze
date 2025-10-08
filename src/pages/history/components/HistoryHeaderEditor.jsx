import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { upsertHistoryHeaderSettings, getHistoryHeaderSettings } from '../../../utils/posterService';

const HistoryHeaderEditor = ({ open, onClose }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [stats, setStats] = useState({ posters: '', days: '', shares: '', views_week: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const val = await getHistoryHeaderSettings();
      if (val) {
        setTitle(val.title || '');
        setSubtitle(val.subtitle || '');
        setStats({
          posters: val?.stats?.posters || '',
          days: val?.stats?.days || '',
          shares: val?.stats?.shares || '',
          views_week: val?.stats?.views_week || ''
        });
      }
    })();
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    const ok = await upsertHistoryHeaderSettings({
      title,
      subtitle,
      stats
    });
    setSaving(false);
    if (ok) onClose?.();
    else alert('Erreur lors de la sauvegarde');
  };

  return (
    <div className="fixed inset-0 z-modal-backdrop bg-black/50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="bg-background rounded-lg w-full max-w-lg p-4 space-y-4 border border-border">
        <h3 className="text-lg font-semibold">Éditer l'en-tête de l'historique</h3>
        <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium mb-2">Sous-titre</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full h-24 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Affiches partagées" value={stats.posters} onChange={(e) => setStats(prev => ({ ...prev, posters: e.target.value }))} />
          <Input label="Jours d'inspiration" value={stats.days} onChange={(e) => setStats(prev => ({ ...prev, days: e.target.value }))} />
          <Input label="Partages totaux" value={stats.shares} onChange={(e) => setStats(prev => ({ ...prev, shares: e.target.value }))} />
          <Input label="Vues cette semaine" value={stats.views_week} onChange={(e) => setStats(prev => ({ ...prev, views_week: e.target.value }))} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </div>
      </div>
    </div>
  );
};

export default HistoryHeaderEditor;


