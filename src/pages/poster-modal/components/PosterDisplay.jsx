import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PosterDisplay = ({ poster, onClose }) => {
  if (!poster) return null;

  return (
    <div className="relative bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in shadow-lg">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm rounded-full p-2 text-text-secondary hover:text-text-primary hover:bg-background transition-all duration-200 ease-gentle shadow-md"
        aria-label="Fermer la modale"
      >
        <Icon name="X" size={20} />
      </button>
      {/* Poster Image */}
      <div className="relative bg-surface">
        <Image
          src={poster?.image}
          alt={poster?.title || 'Affiche inspirante'}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
      </div>
      {/* Poster Details */}
      <div className="p-6 space-y-4 bg-background">
        {poster?.title && (
          <h2 className="text-2xl font-semibold text-text-primary text-center">
            {poster?.title}
          </h2>
        )}
        
        {poster?.description && (
          <p className="text-text-secondary text-center leading-relaxed max-w-2xl mx-auto">
            {poster?.description}
          </p>
        )}

        {poster?.date && (
          <div className="flex items-center justify-center text-sm text-text-secondary">
            <Icon name="Calendar" size={16} className="mr-2" />
            {new Date(poster.date)?.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterDisplay;