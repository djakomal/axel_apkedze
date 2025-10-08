import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import ShareButtonGroup from '../../../components/ui/ShareButtonGroup';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import DownloadButton from '../../../components/ui/DownloadButton';

const HistoryEntry = ({ date, posters, isExpanded, onToggle, onDeleteEntry, onDeletePoster }) => {
  const [imageErrors, setImageErrors] = useState({});
  const { isAdmin } = useAuth();

  const handleImageError = (posterId) => {
    setImageErrors(prev => ({ ...prev, [posterId]: true }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden breathing-card">
      {/* Date Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors duration-200 ease-gentle"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Masquer' : 'Afficher'} les affiches du ${formatDate(date)}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon 
              name="Calendar" 
              size={20} 
              className="text-primary"
            />
          </div>
          <div>
            <h3 className="font-heading-semibold text-text-primary">
              {formatDate(date)}
            </h3>
            <p className="text-sm text-text-secondary font-body-normal">
              {posters?.length} affiches inspirantes
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-2 mr-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée d\'historique complète ?')) {
                  onDeleteEntry?.(date);
                }
              }}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        )}
        
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className={`text-text-secondary transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : 'rotate-0'
          }`}
        />
      </button>
      {/* Expanded Content */}
      <div className={`progressive-disclosure ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4">
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {posters?.map((poster, index) => (
                <div 
                  key={poster?.id}
                  className="bg-surface rounded-lg overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow duration-200 contextual-micro-interaction show"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={imageErrors?.[poster?.id] ? '/assets/images/no_image.png' : poster?.image}
                      alt={poster?.title || `Affiche inspirante ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 ease-gentle"
                      onError={() => handleImageError(poster?.id)}
                    />
                    
                    {/* Overlay with title if available */}
                    {poster?.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <h4 className="text-white font-heading-medium text-sm leading-tight">
                          {poster?.title}
                        </h4>
                      </div>
                    )}
                  </div>

                  {/* Poster Actions */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary font-mono-normal">
                        Affiche {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <DownloadButton 
                          poster={poster}
                          variant="single"
                          size="sm"
                          showText={false}
                        />
                        {isAdmin && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affiche ?')) {
                                onDeletePoster?.(date, poster.id);
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                        <ShareButtonGroup 
                          poster={poster}
                          variant="card"
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryEntry;