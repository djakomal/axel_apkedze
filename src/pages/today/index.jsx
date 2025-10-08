import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import PosterModal from '../../components/ui/PosterModal';
import PosterGrid from './components/PosterGrid';
import TodayHeader from './components/TodayHeader';
import { getTodayPosters, getPosters } from '../../utils/posterService';
import useRealtimePosters from '../../hooks/useRealtimePosters';

const Today = () => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate] = useState(new Date());

  // Charger les posters depuis la base de données
  const loadTodayPosters = async () => {
    try {
      console.log('🔄 Today Page - Chargement des posters...');
      setLoading(true);
      // Tente de charger uniquement les posters du jour
      let data = await getTodayPosters(4);
      if (!data || data.length === 0) {
        // fallback: derniers posters
        data = await getPosters();
      }
      
      console.log('📊 Today Page - Posters récupérés:', data?.length || 0);
      console.log('📋 Today Page - Données brutes:', data);
      
      // Filtrer les posters d'aujourd'hui ou prendre les plus récents
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      console.log('📅 Today Page - Période aujourd\'hui:', {
        start: todayStart.toISOString(),
        end: todayEnd.toISOString()
      });
      
      let todayPosters = data.filter(poster => {
        const posterDate = new Date(poster.created_at);
        const isToday = posterDate >= todayStart && posterDate < todayEnd;
        console.log(`📅 Poster "${poster.title}" créé le ${posterDate.toISOString()} - Aujourd'hui: ${isToday}`);
        return isToday;
      });
      
      console.log('📊 Today Page - Posters d\'aujourd\'hui:', todayPosters.length);
      
      // Si pas de posters aujourd'hui, prendre les 4 plus récents
      if (todayPosters.length === 0) {
        console.log('⚠️ Today Page - Aucun poster aujourd\'hui, prise des 4 plus récents');
        todayPosters = data.slice(0, 4);
      }
      
      // Formater les données pour l'interface
      // Créer une carte par image avec sa description correspondante
      const formattedPosters = todayPosters.flatMap(poster => {
        const posterImages = poster.images && poster.images.length > 0
          ? poster.images
          : (poster.image_url ? [poster.image_url] : []);

        // Toujours créer une carte par image, même s'il n'y en a qu'une
        return posterImages.slice(0, 4).map((imgUrl, idx) => ({
          id: `${poster.id}-${idx + 1}`,
          title: poster.title,
          // Utiliser la description spécifique à cette image si disponible
          description: poster.images_descriptions?.[idx] || poster.description,
          image: imgUrl,
          // Ne pas inclure toutes les images dans chaque carte
          date: poster.created_at,
          shareUrl: `${window.location.origin}/today#poster-${poster.id}-${idx + 1}`
        }));
      });
      
      console.log('✅ Today Page - Posters formatés:', formattedPosters);
      setPosters(formattedPosters);
    } catch (error) {
      console.error('💥 Today Page - Erreur lors du chargement des posters:', error);
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayPosters();
  }, []);

  // Gérer les mises à jour en temps réel
  const handleRealtimeUpdate = useCallback(({ eventType, new: newRecord, old: oldRecord }) => {
    console.log('Today Page - Mise à jour temps réel:', eventType, newRecord, oldRecord);
    
    switch (eventType) {
      case 'INSERT':
        // Recharger les posters pour intégrer le nouveau
        loadTodayPosters();
        break;
        
      case 'UPDATE':
        // Mettre à jour le poster existant
        setPosters(prev => prev.map(poster => 
          poster.id === newRecord.id 
            ? {
                ...poster,
                title: newRecord.title,
                description: newRecord.description,
                image: newRecord.images?.[0] || newRecord.image_url,
                images: newRecord.images || [newRecord.image_url]
              }
            : poster
        ));
        break;
        
      case 'DELETE':
        // Supprimer le poster de l'état local
        setPosters(prev => prev.filter(poster => poster.id !== oldRecord.id));
        break;
        
      default:
        console.log('Événement non géré:', eventType);
    }
  }, []);

  // Abonnement aux mises à jour en temps réel
  const { isConnected } = useRealtimePosters(handleRealtimeUpdate);

  const handlePosterClick = (poster) => {
    setSelectedPoster(poster);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoster(null);
  };

  return (
    <>
      <Helmet>
        <title>Posters d'Aujourd'hui - Daily Posters</title>
        <meta name="description" content="Découvrez nos 4 posters inspirants du jour pour bénir et motiver votre communauté." />
        <meta property="og:title" content="Posters d'Aujourd'hui - Daily Posters" />
        <meta property="og:description" content="Découvrez nos 4 posters inspirants du jour pour bénir et motiver votre communauté." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 pb-24">
          <TodayHeader currentDate={currentDate} />
          
          <div className="max-w-6xl mx-auto">
            <PosterGrid
              posters={posters}
              onPosterClick={handlePosterClick}
              loading={loading}
            />
          </div>

          {/* Empty State */}
          {!loading && posters?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-heading-semibold text-text-primary mb-2">
                Aucun poster disponible
              </h3>
              <p className="text-text-secondary font-body-normal">
                Les posters d'aujourd'hui seront bientôt disponibles.
              </p>
            </div>
          )}
        </div>

        {/* Poster Modal */}
        <PosterModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          poster={selectedPoster}
        />

        {/* Bottom Navigation */}
        <BottomTabNavigation />
      </div>
    </>
  );
};

export default Today;