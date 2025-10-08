import Icon from '../../../components/AppIcon';

const MissionStatement = () => {
  return (
    <div className="bg-card rounded-lg p-6 md:p-8 shadow-soft mb-8">
      {/* Mission Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 rounded-full p-4">
          <Icon name="Sparkles" size={32} className="text-primary" />
        </div>
      </div>

      {/* Main Mission Statement */}
      <div className="text-center space-y-4">
        <h3 className="text-xl md:text-2xl font-heading-semibold text-text-primary">
          Notre Mission
        </h3>
        <p className="text-lg md:text-xl font-body-medium text-text-primary leading-relaxed">
          "Nous partageons 4 affiches inspirantes quotidiennement pour bénir notre communauté"
        </p>
        <p className="text-text-secondary font-body-normal leading-relaxed max-w-2xl mx-auto">
          Chaque jour, nous sélectionnons soigneusement quatre messages d'inspiration pour apporter de la joie, de l'espoir et de la motivation à tous ceux qui nous suivent. Notre objectif est de créer un moment de réflexion positive dans votre journée.
        </p>
      </div>
    </div>
  );
};

export default MissionStatement;