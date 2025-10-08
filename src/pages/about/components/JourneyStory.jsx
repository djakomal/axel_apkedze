import Icon from '../../../components/AppIcon';

const JourneyStory = () => {
  const milestones = [
    {
      year: "2020",
      title: "Le Commencement",
      description: "Nous avons commencé à partager des messages inspirants avec nos proches pendant la pandémie.",
      icon: "Lightbulb"
    },
    {
      year: "2022",
      title: "Croissance Communautaire",
      description: "Notre petite initiative s\'est transformée en une communauté de milliers de personnes.",
      icon: "Users"
    },
    {
      year: "2024",
      title: "Plateforme Dédiée",
      description: "Lancement de cette application pour mieux servir notre communauté grandissante.",
      icon: "Rocket"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <h3 className="text-xl md:text-2xl font-heading-semibold text-text-primary text-center mb-8">
        Notre Parcours
      </h3>
      <div className="space-y-6">
        {milestones?.map((milestone, index) => (
          <div key={milestone?.year} className="flex items-start space-x-4 contextual-micro-interaction show" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Timeline Icon */}
            <div className="flex-shrink-0 bg-primary/10 rounded-full p-3 mt-1">
              <Icon name={milestone?.icon} size={20} className="text-primary" />
            </div>
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-caption-medium">
                  {milestone?.year}
                </span>
                <h4 className="text-lg font-heading-medium text-text-primary">
                  {milestone?.title}
                </h4>
              </div>
              <p className="text-text-secondary font-body-normal leading-relaxed">
                {milestone?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JourneyStory;