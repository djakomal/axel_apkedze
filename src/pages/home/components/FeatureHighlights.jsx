import Icon from '../../../components/AppIcon';

const FeatureHighlights = () => {
  const features = [
    {
      id: 1,
      icon: 'Image',
      title: '4 Affiches Quotidiennes',
      description: 'Découvrez de nouvelles inspirations chaque jour avec notre collection soigneusement sélectionnée.'
    },
    {
      id: 2,
      icon: 'Share2',
      title: 'Partage Facile',
      description: 'Partagez instantanément sur WhatsApp et Facebook pour répandre la positivité.'
    },
    {
      id: 3,
      icon: 'Clock',
      title: 'Historique Complet',
      description: 'Accédez à toutes les affiches précédentes et retrouvez vos inspirations favorites.'
    },
    {
      id: 4,
      icon: 'Users',
      title: 'Communauté Bienveillante',
      description: 'Rejoignez notre communauté dédiée au partage de bénédictions quotidiennes.'
    }
  ];

  return (
    <div className="py-16 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading-semibold text-text-primary mb-4">
            Pourquoi Daily Posters ?
          </h2>
          <p className="text-text-secondary font-body-normal max-w-2xl mx-auto">
            Une plateforme simple et élégante pour partager l'inspiration quotidienne avec votre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features?.map((feature, index) => (
            <div
              key={feature?.id}
              className="contextual-micro-interaction show breathing-card bg-background rounded-lg p-6 text-center shadow-soft hover:shadow-soft-lg transition-all duration-300 ease-gentle"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon 
                  name={feature?.icon} 
                  size={24} 
                  className="text-primary" 
                />
              </div>
              <h3 className="text-lg font-heading-medium text-text-primary mb-2">
                {feature?.title}
              </h3>
              <p className="text-sm text-text-secondary font-body-normal leading-relaxed">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlights;