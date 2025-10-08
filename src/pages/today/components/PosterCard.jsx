import Image from '../../../components/AppImage';
import ShareButtonGroup from '../../../components/ui/ShareButtonGroup';
import DownloadButton from '../../../components/ui/DownloadButton';

const PosterCard = ({ poster, onPosterClick }) => {
  const handleCardClick = () => {
    onPosterClick(poster);
  };

  return (
    <div className="bg-card rounded-lg shadow-soft overflow-hidden breathing-card group">
      {/* Poster Image */}
      <div 
        className="relative cursor-pointer overflow-hidden"
        onClick={handleCardClick}
      >
        {poster?.images && poster.images.length > 1 ? (
          <div className="grid grid-cols-2 gap-0">
            {poster.images.slice(0, 4).map((img, i) => (
              <div key={i} className="relative h-32 overflow-hidden">
                <Image
                  src={img}
                  alt={poster?.title || `Poster inspirant ${poster?.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src={poster?.image}
            alt={poster?.title || `Poster inspirant ${poster?.id}`}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      {/* Poster Content */}
      <div className="p-4 space-y-3">
        {poster?.title && (
          <h3 className="text-lg font-heading-semibold text-text-primary line-clamp-2">
            {poster?.title}
          </h3>
        )}
        
        {(() => {
          // Si plusieurs images et descriptions disponibles, afficher la description indexée
          if (poster?.images && poster.images.length > 1 && poster?.images_descriptions) {
            // Essayer d'extraire l'index depuis l'id basé sur `${posterId}-${idx+1}`
            const match = typeof poster.id === 'string' ? poster.id.match(/-(\d+)$/) : null;
            const idx = match ? Math.max(0, (parseInt(match[1], 10) - 1)) : 0;
            const desc = poster.images_descriptions[idx] || poster.description;
            return desc ? (
              <p className="text-sm text-text-secondary line-clamp-2 font-body-normal">{desc}</p>
            ) : null;
          }
          return poster?.description ? (
            <p className="text-sm text-text-secondary line-clamp-2 font-body-normal">{poster?.description}</p>
          ) : null;
        })()}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <ShareButtonGroup 
              poster={poster}
              variant="card"
              className="flex-1"
            />
            <div className="ml-3">
              <DownloadButton 
                poster={poster}
                variant="single"
                size="sm"
                showText={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;