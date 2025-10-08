import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';
import ShareButtonGroup from './ShareButtonGroup';
import DownloadButton from './DownloadButton';

const PosterModal = ({ isOpen, onClose, poster }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mettre à jour l'index de l'image lorsque le poster change
  useEffect(() => {
    if (poster) {
      setCurrentImageIndex(poster.selectedImageIndex || 0);
    }
  }, [poster]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !poster) return null;

  const handleBackdropClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-modal-backdrop bg-black/50 gesture-modal flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-background rounded-modal max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in shadow-soft-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-modal-content bg-background/80 backdrop-blur-sm rounded-full p-2 text-text-secondary hover:text-text-primary hover:bg-background transition-all duration-200 ease-gentle shadow-soft"
          aria-label="Close modal"
        >
          <Icon name="X" size={20} />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col">
          {/* Poster Image */}
          <div className="relative bg-surface p-2">
            {poster?.images && poster.images.length > 0 ? (
              <div className="carousel-container">
                <div className="main-image-container">
                  <Image
                    src={poster?.images?.[currentImageIndex] || poster?.image}
                    alt={poster?.title || 'Inspirational poster'}
                    className="w-full h-auto max-h-[50vh] rounded-md shadow-md"
                    objectFit="contain"
                  />
                  {poster?.images_descriptions && poster.images_descriptions[currentImageIndex] && (
                    <p className="text-sm text-center mt-2 text-text-secondary">
                      {poster.images_descriptions[currentImageIndex]}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Image
                  src={poster?.image}
                  alt={poster?.title || 'Inspirational poster'}
                  className="w-full h-auto max-h-[60vh] rounded-md shadow-md"
                  objectFit="contain"
                />
                {poster?.description && (
                  <p className="text-sm text-center mt-2 text-text-secondary">
                    {poster.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Poster Details */}
          <div className="p-6 space-y-4">
            {poster?.title && (
              <h2 className="text-xl font-heading-semibold text-text-primary">
                {poster?.title}
              </h2>
            )}
            
            {poster?.description && (
              <p className="text-text-secondary font-body-normal leading-relaxed">
                {poster?.description}
              </p>
            )}

            {poster?.date && (
              <div className="flex items-center text-sm text-text-secondary font-mono-normal">
                <Icon name="Calendar" size={16} className="mr-2" />
                {new Date(poster.date)?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border space-y-4">
              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <DownloadButton 
                  poster={poster}
                  variant="single"
                  size="default"
                  showText={true}
                />
                {poster?.images && poster.images.length > 1 && (
                  <DownloadButton 
                    poster={poster}
                    variant="all"
                    size="default"
                    showText={true}
                  />
                )}
              </div>
              
              {/* Share Buttons */}
              <ShareButtonGroup 
                poster={poster}
                variant="modal"
                className="justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PosterModal;