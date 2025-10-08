import Icon from '../../../components/AppIcon';

const DailyStats = () => {
  const stats = [
    {
      id: 1,
      icon: 'Calendar',
      value: '30',
      label: 'Jours Actifs',
      description: 'De partage quotidien'
    },
    {
      id: 2,
      icon: 'Image',
      value: '120+',
      label: 'Affiches Partagées',
      description: 'Inspirations créées'
    },
    {
      id: 3,
      icon: 'Heart',
      value: '500+',
      label: 'Partages Communautaires',
      description: 'Bénédictions répandues'
    }
  ];

  return (
    <div className="py-12 px-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-heading-semibold text-text-primary mb-2">
            Notre Impact Quotidien
          </h2>
          <p className="text-text-secondary font-body-normal">
            Ensemble, nous créons une communauté d'inspiration positive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats?.map((stat, index) => (
            <div
              key={stat?.id}
              className="contextual-micro-interaction show text-center"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="bg-background rounded-lg p-6 shadow-soft breathing-card">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon 
                    name={stat?.icon} 
                    size={28} 
                    className="text-primary" 
                  />
                </div>
                <div className="text-3xl font-heading-bold text-text-primary mb-1">
                  {stat?.value}
                </div>
                <div className="text-lg font-heading-medium text-text-primary mb-1">
                  {stat?.label}
                </div>
                <div className="text-sm text-text-secondary font-body-normal">
                  {stat?.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyStats;