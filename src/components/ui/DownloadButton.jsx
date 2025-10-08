import { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { downloadImage, downloadAllPosterImages, isDownloadSupported } from '../../utils/downloadService';

const DownloadButton = ({ 
  poster, 
  variant = 'single', // 'single' | 'all'
  size = 'default', // 'sm' | 'default' | 'lg'
  className = '',
  showText = true,
  imageUrl = null // Pour télécharger une image spécifique
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Vérifier si le téléchargement est supporté
  if (!isDownloadSupported()) {
    return null;
  }

  const handleDownload = async (e) => {
    e.stopPropagation(); // Empêcher la propagation vers les parents
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      let success = false;
      
      if (variant === 'all' && poster) {
        // Télécharger toutes les images du poster
        success = await downloadAllPosterImages(poster);
        
        if (success) {
          // Afficher une notification de succès
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(100);
          }
        }
      } else {
        // Télécharger une seule image
        const urlToDownload = imageUrl || poster?.image || poster?.images?.[0];
        if (urlToDownload) {
          const filename = poster?.title 
            ? `${poster.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.jpg`
            : null;
          success = await downloadImage(urlToDownload, filename);
        }
      }
      
      if (!success) {
        alert('Erreur lors du téléchargement. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement. Veuillez réessayer.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonText = () => {
    if (isDownloading) {
      return variant === 'all' ? 'Téléchargement...' : 'Téléchargement...';
    }
    
    if (!showText) return '';
    
    return variant === 'all' ? 'Tout télécharger' : 'Télécharger';
  };

  const getIconName = () => {
    if (isDownloading) return 'Loader2';
    return variant === 'all' ? 'Download' : 'Download';
  };

  const buttonSizeClass = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  }[size];

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant="outline"
      size={size}
      className={`
        inline-flex items-center space-x-2 
        hover:bg-primary hover:text-primary-foreground 
        transition-all duration-200 ease-gentle
        ${isDownloading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        ${className}
      `}
      title={variant === 'all' ? 'Télécharger toutes les images' : 'Télécharger cette image'}
    >
      <Icon 
        name={getIconName()} 
        size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
        className={isDownloading ? 'animate-spin' : ''}
      />
      {showText && (
        <span className={buttonSizeClass}>
          {getButtonText()}
        </span>
      )}
    </Button>
  );
};

export default DownloadButton;
