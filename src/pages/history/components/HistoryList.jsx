import { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import HistoryEntry from './HistoryEntry';
import { getPostersGroupedByDate, deleteHistoryEntry, deleteHistoryPoster } from '../../../utils/posterService';
import { useAuth } from '../../../context/AuthContext';
import useRealtimePosters from '../../../hooks/useRealtimePosters';

const HistoryList = () => {
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [visibleEntries, setVisibleEntries] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Charger les données réelles depuis la base de données
  const loadHistoryData = async () => {
    try {
      setInitialLoading(true);
      const data = await getPostersGroupedByDate(30);
      setHistoryData(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      // En cas d'erreur, utiliser des données de fallback
      setHistoryData([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadHistoryData();
  }, []);

  // Gérer les mises à jour en temps réel
  const handleRealtimeUpdate = useCallback(({ eventType, new: newRecord, old: oldRecord }) => {
    console.log('Mise à jour temps réel:', eventType, newRecord, oldRecord);
    
    switch (eventType) {
      case 'INSERT':
        // Recharger les données pour intégrer le nouveau poster
        loadHistoryData();
        break;
        
      case 'UPDATE':
        // Mettre à jour le poster existant
        setHistoryData(prev => prev.map(entry => ({
          ...entry,
          posters: entry.posters.map(poster => 
            poster.id === newRecord.id 
              ? {
                  ...poster,
                  title: newRecord.title,
                  description: newRecord.description,
                  image: newRecord.images?.[0] || newRecord.image_url,
                  images: newRecord.images || [newRecord.image_url]
                }
              : poster
          )
        })));
        break;
        
      case 'DELETE':
        // Supprimer le poster de l'état local
        setHistoryData(prev => prev.map(entry => ({
          ...entry,
          posters: entry.posters.filter(poster => poster.id !== oldRecord.id)
        })).filter(entry => entry.posters.length > 0));
        break;
        
      default:
        console.log('Événement non géré:', eventType);
    }
  }, []);

  // Abonnement aux mises à jour en temps réel
  const { isConnected } = useRealtimePosters(handleRealtimeUpdate);

  const handleToggleEntry = (date) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(date)) {
        newSet?.delete(date);
      } else {
        newSet?.add(date);
      }
      return newSet;
    });
  };

  const handleDeleteEntry = async (dateToDelete) => {
    if (!isAdmin) return;
    
    try {
      await deleteHistoryEntry(dateToDelete);
      
      // Mettre à jour l'état local
      setHistoryData(prev => prev.filter(entry => entry.date !== dateToDelete));
      setExpandedEntries(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateToDelete);
        return newSet;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée:', error);
      alert('Erreur lors de la suppression de l\'entrée d\'historique');
    }
  };

  const handleDeletePoster = async (entryDate, posterId) => {
    if (!isAdmin) return;
    
    try {
      await deleteHistoryPoster(posterId);
      
      // Mettre à jour l'état local
      setHistoryData(prev => prev.map(entry => {
        if (entry.date === entryDate) {
          const updatedPosters = entry.posters.filter(poster => poster.id !== posterId);
          return { ...entry, posters: updatedPosters };
        }
        return entry;
      }).filter(entry => entry.posters.length > 0)); // Supprimer l'entrée si plus d'affiches
    } catch (error) {
      console.error('Erreur lors de la suppression du poster:', error);
      alert('Erreur lors de la suppression du poster');
    }
  };

  const loadMoreEntries = () => {
    if (isLoading || visibleEntries >= historyData?.length) return;
    
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setVisibleEntries(prev => Math.min(prev + 10, historyData?.length));
      setIsLoading(false);
    }, 500);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && visibleEntries < historyData.length) {
          loadMoreEntries();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer?.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer?.unobserve(sentinel);
      }
    };
  }, [isLoading, visibleEntries, historyData?.length]);

  // Affichage de chargement initial
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-text-secondary">
          <div className="animate-spin">
            <Icon name="Loader2" size={24} />
          </div>
          <span className="font-body-normal">Chargement de l'historique...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicateur de connexion temps réel */}
      {isAdmin && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
          <span className="text-text-secondary">Mises à jour en temps réel</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>
      )}
      
      {/* History Entries */}
      {historyData?.slice(0, visibleEntries)?.map((entry, index) => (
        <HistoryEntry
          key={entry?.date}
          date={entry?.date}
          posters={entry?.posters}
          isExpanded={expandedEntries?.has(entry?.date)}
          onToggle={() => handleToggleEntry(entry?.date)}
          onDeleteEntry={handleDeleteEntry}
          onDeletePoster={handleDeletePoster}
        />
      ))}
      
      {/* Message si aucune donnée */}
      {historyData?.length === 0 && !initialLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-text-secondary">
            <Icon name="Calendar" size={24} />
            <span className="font-body-normal">
              Aucune affiche dans l'historique pour le moment
            </span>
          </div>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-text-secondary">
            <div className="animate-spin">
              <Icon name="Loader2" size={20} />
            </div>
            <span className="font-body-normal">Chargement des entrées précédentes...</span>
          </div>
        </div>
      )}
      {/* Load More Button (fallback) */}
      {!isLoading && visibleEntries < historyData?.length && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMoreEntries}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-body-medium hover:bg-primary/90 transition-colors duration-200 ease-gentle"
          >
            Charger plus d'entrées
          </button>
        </div>
      )}
      {/* End of List Message */}
      {visibleEntries >= historyData?.length && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-text-secondary">
            <Icon name="CheckCircle" size={20} />
            <span className="font-body-normal">
              Vous avez vu toutes les affiches historiques
            </span>
          </div>
        </div>
      )}
      {/* Scroll Sentinel */}
      <div id="scroll-sentinel" className="h-1" />
    </div>
  );
};

export default HistoryList;