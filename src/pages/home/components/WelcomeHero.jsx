import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WelcomeHero = () => {
  const navigate = useNavigate();

  const handleViewTodayPosters = () => {
    navigate('/today');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6 py-8 text-center">
      {/* Logo Section */}
      <div className="mb-8 breathing-card">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-soft-lg">
          <Icon 
            name="Heart" 
            size={48} 
            className="text-primary md:w-16 md:h-16" 
          />
        </div>
      </div>
      {/* Welcome Message */}
      <div className="max-w-2xl mx-auto mb-12 space-y-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading-bold text-text-primary leading-tight">
          Bienvenue sur Daily Posters
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary font-body-normal leading-relaxed">
          Nous partageons 4 affiches inspirantes chaque jour pour bénir notre communauté et répandre la motivation quotidienne.
        </p>
        
        <div className="flex items-center justify-center text-text-secondary font-body-normal">
          <Icon name="Calendar" size={20} className="mr-2 text-primary" />
          <span>
            {new Date()?.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      {/* Call to Action */}
      <div className="contextual-micro-interaction show" style={{ animationDelay: '300ms' }}>
        <Button
          variant="default"
          size="lg"
          onClick={handleViewTodayPosters}
          iconName="ArrowRight"
          iconPosition="right"
          iconSize={20}
          className="px-8 py-4 text-lg font-heading-medium shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 ease-gentle bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Voir les affiches d'aujourd'hui
        </Button>
      </div>
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Icon name="Sparkles" size={32} className="text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-32 right-10 opacity-10">
        <Icon name="Star" size={28} className="text-accent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default WelcomeHero;