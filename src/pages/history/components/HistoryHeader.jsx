import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getHistoryHeaderSettings } from '../../../utils/posterService';

const HistoryHeader = ({ onEdit }) => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const load = async () => {
      const val = await getHistoryHeaderSettings();
      setSettings(val);
    };
    load();
  }, []);

  const getCurrentDate = () => {
    return new Date()?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon 
            name="History" 
            size={24} 
            className="text-primary"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-heading-bold text-text-primary mb-2">
              {settings?.title || 'Historique des Affiches'}
            </h1>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Icon name="Edit" size={16} className="mr-2" />
                Éditer
              </Button>
            )}
          </div>
          
          <p className="text-text-secondary font-body-normal leading-relaxed mb-3">
            {settings?.subtitle || `Redécouvrez nos affiches inspirantes des jours précédents. Chaque jour, nous partageons 4 messages de bénédiction pour enrichir votre communauté.`}
          </p>
          
          <div className="flex items-center text-sm text-text-secondary font-mono-normal">
            <Icon name="Calendar" size={16} className="mr-2" />
            <span>Aujourd'hui: {getCurrentDate()}</span>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-heading-semibold text-primary">{settings?.stats?.posters || '120'}</div>
            <div className="text-xs text-text-secondary font-body-normal">Affiches partagées</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-heading-semibold text-primary">{settings?.stats?.days || '30'}</div>
            <div className="text-xs text-text-secondary font-body-normal">Jours d'inspiration</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-heading-semibold text-primary">{settings?.stats?.shares || '2.4k'}</div>
            <div className="text-xs text-text-secondary font-body-normal">Partages totaux</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-heading-semibold text-primary">{settings?.stats?.views_week || '850'}</div>
            <div className="text-xs text-text-secondary font-body-normal">Vues cette semaine</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryHeader;