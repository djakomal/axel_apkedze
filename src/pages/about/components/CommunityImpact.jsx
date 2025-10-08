import Icon from '../../../components/AppIcon';

const CommunityImpact = () => {
  const impactStats = [
    {
      number: "1,200+",
      label: "Affiches Partagées",
      description: "Messages d'inspiration diffusés",
      icon: "Image",
      color: "text-blue-600"
    },
    {
      number: "15K+",
      label: "Membres Communauté",
      description: "Personnes inspirées quotidiennement",
      icon: "Heart",
      color: "text-red-500"
    },
    {
      number: "50K+",
      label: "Partages Sociaux",
      description: "Messages redistribués par la communauté",
      icon: "Share2",
      color: "text-green-600"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 md:p-8 mb-8">
      <h3 className="text-xl md:text-2xl font-heading-semibold text-text-primary text-center mb-8">
        Impact Communautaire
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {impactStats?.map((stat, index) => (
          <div 
            key={stat?.label} 
            className="text-center space-y-3 contextual-micro-interaction show"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex justify-center">
              <div className="bg-background rounded-full p-4 shadow-soft">
                <Icon name={stat?.icon} size={24} className={stat?.color} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-heading-bold text-text-primary">
                {stat?.number}
              </div>
              <div className="text-sm font-caption-medium text-text-primary">
                {stat?.label}
              </div>
              <div className="text-xs text-text-secondary font-body-normal">
                {stat?.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityImpact;