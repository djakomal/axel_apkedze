import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactInfo = () => {
  const contactMethods = [
    {
      platform: "Email",
      handle: "marie.pierre@dailyposters.fr",
      icon: "Mail",
      color: "text-blue-600",
      action: () => window.open('mailto:marie.pierre@dailyposters.fr', '_blank')
    },
    {
      platform: "Instagram",
      handle: "@dailyposters_fr",
      icon: "Instagram",
      color: "text-pink-600",
      action: () => window.open('https://instagram.com/dailyposters_fr', '_blank')
    },
    {
      platform: "Facebook",
      handle: "Daily Posters France",
      icon: "Facebook",
      color: "text-blue-700",
      action: () => window.open('https://facebook.com/dailyposters.france', '_blank')
    }
  ];

  return (
    <div className="bg-card rounded-lg p-6 md:p-8 shadow-soft">
      <h3 className="text-xl md:text-2xl font-heading-semibold text-text-primary text-center mb-6">
        Restons Connectés
      </h3>
      <p className="text-text-secondary font-body-normal text-center mb-8 leading-relaxed">
        Nous aimons entendre vos retours et suggestions. N'hésitez pas à nous contacter pour partager comment nos affiches vous inspirent au quotidien.
      </p>
      <div className="space-y-4">
        {contactMethods?.map((method, index) => (
          <div 
            key={method?.platform}
            className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow-soft transition-all duration-200 contextual-micro-interaction show"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-muted rounded-full p-2">
                <Icon name={method?.icon} size={20} className={method?.color} />
              </div>
              <div>
                <div className="font-caption-medium text-text-primary">
                  {method?.platform}
                </div>
                <div className="text-sm text-text-secondary font-body-normal">
                  {method?.handle}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={method?.action}
              iconName="ExternalLink"
              iconPosition="right"
              iconSize={16}
              className="text-text-secondary hover:text-text-primary"
            >
              Contacter
            </Button>
          </div>
        ))}
      </div>
      {/* Call to Action */}
      <div className="mt-8 text-center">
        <p className="text-sm text-text-secondary font-body-normal mb-4">
          Rejoignez notre mission d'inspiration quotidienne
        </p>
        <Button
          variant="default"
          iconName="Heart"
          iconPosition="left"
          iconSize={16}
          className="contextual-micro-interaction show"
          style={{ animationDelay: '400ms' }}
        >
          Partager l'Inspiration
        </Button>
      </div>
    </div>
  );
};

export default ContactInfo;