import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ModalOverlay from './components/ModalOverlay';
import PosterDisplay from './components/PosterDisplay';
import SocialShareButtons from './components/SocialShareButtons';

const PosterModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentPoster, setCurrentPoster] = useState(null);

  // Mock poster data for demonstration
  const mockPosters = [
    {
      id: 1,
      title: "La Gratitude Transforme Tout",
      description: `Chaque matin apporte de nouvelles bénédictions.\nPrenez un moment pour apprécier les petites joies de la vie.\nLa gratitude ouvre le cœur à l'abondance.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop",
      date: "2024-09-30",
      shareUrl: `${window.location?.origin}/poster-modal?id=1`
    },
    {
      id: 2,
      title: "Force Intérieure",
      description: `Vous êtes plus fort que vous ne le pensez.\nChaque défi est une opportunité de grandir.\nLa résilience se construit jour après jour.`,
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=1000&fit=crop",
      date: "2024-09-30",
      shareUrl: `${window.location?.origin}/poster-modal?id=2`
    },
    {
      id: 3,
      title: "Paix Intérieure",
      description: `Dans le silence, nous trouvons la sagesse.\nLa méditation apporte la clarté d'esprit.\nLa paix commence à l'intérieur de nous.`,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1000&fit=crop",
      date: "2024-09-30",
      shareUrl: `${window.location?.origin}/poster-modal?id=3`
    },
    {
      id: 4,
      title: "Espoir et Lumière",
      description: `Après chaque nuit vient l'aube.\nL'espoir illumine même les moments les plus sombres.\nGardez foi en l'avenir radieux qui vous attend.`,
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1000&fit=crop",
      date: "2024-09-30",
      shareUrl: `${window.location?.origin}/poster-modal?id=4`
    }
  ];

  useEffect(() => {
    // Get poster ID from URL params or state
    const urlParams = new URLSearchParams(location.search);
    const posterId = urlParams?.get('id') || location?.state?.posterId;
    
    if (posterId) {
      const poster = mockPosters?.find(p => p?.id === parseInt(posterId));
      setCurrentPoster(poster || mockPosters?.[0]);
    } else {
      // Default to first poster if no ID specified
      setCurrentPoster(mockPosters?.[0]);
    }
  }, [location]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Navigate back to previous page or default to today
    const previousPage = location?.state?.from || '/today';
    navigate(previousPage);
  };

  return (
    <div className="min-h-screen bg-background">
      <ModalOverlay isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="w-full max-w-4xl mx-auto">
          <PosterDisplay 
            poster={currentPoster} 
            onClose={handleCloseModal}
          />
          
          {currentPoster && (
            <div className="mt-4 bg-background rounded-lg p-4 shadow-lg">
              <SocialShareButtons poster={currentPoster} />
            </div>
          )}
        </div>
      </ModalOverlay>

      <BottomTabNavigation />
    </div>
  );
};

export default PosterModal;