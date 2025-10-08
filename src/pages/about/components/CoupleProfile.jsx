import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CoupleProfile = () => {
  return (
    <div className="flex flex-col items-center space-y-6 mb-8">
      {/* Couple Photo */}
      <div className="relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-soft-lg bg-gradient-to-br from-primary/20 to-accent/20 p-1">
          <div className="w-full h-full rounded-full overflow-hidden bg-background">
            <Image
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop&crop=faces"
              alt="Marie et Pierre - Couple partageant l'inspiration quotidienne"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Decorative heart icon */}
        <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-soft">
          <Icon name="Heart" size={16} className="text-primary-foreground fill-current" />
        </div>
      </div>

      {/* Couple Names */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-heading-semibold text-text-primary mb-2">
          Axel & Apkedze
        </h2>
        <p className="text-text-secondary font-body-normal">
          Partageant l'inspiration depuis 2020
        </p>
      </div>
    </div>
  );
};

export default CoupleProfile;