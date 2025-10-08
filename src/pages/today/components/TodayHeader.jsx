import Icon from '../../../components/AppIcon';

const TodayHeader = ({ currentDate }) => {
  const formatDate = (date) => {
    return date?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="text-center space-y-4 mb-8">
      <div className="flex items-center justify-center gap-3">
        <Icon 
          name="Calendar" 
          size={28} 
          className="text-primary" 
        />
        <h1 className="text-3xl font-heading-bold text-text-primary">
          Posters d'Aujourd'hui
        </h1>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-text-secondary">
        <Icon name="Clock" size={16} />
        <p className="text-lg font-body-medium capitalize">
          {formatDate(currentDate)}
        </p>
      </div>
      
      <p className="text-text-secondary font-body-normal max-w-2xl mx-auto">
        Découvrez nos 4 posters inspirants du jour, spécialement sélectionnés pour bénir et motiver notre communauté.
      </p>
    </div>
  );
};

export default TodayHeader;