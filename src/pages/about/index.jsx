import { Helmet } from 'react-helmet';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import CommunityImpact from './components/CommunityImpact';
import ContactInfo from './components/ContactInfo';
import CoupleProfile from './components/CoupleProfile';
import JourneyStory from './components/JourneyStory';
import MissionStatement from './components/MissionStatement';

const About = () => {
  return (
    <>
      <Helmet>
        <title>À Propos - Daily Posters</title>
        <meta name="description" content="Découvrez Marie et Pierre, le couple derrière Daily Posters qui partage 4 affiches inspirantes quotidiennement pour bénir leur communauté." />
        <meta name="keywords" content="à propos, inspiration quotidienne, couple, communauté, affiches motivantes" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl md:text-4xl font-heading-bold text-text-primary text-center">
              À Propos de Nous
            </h1>
            <p className="text-text-secondary font-body-normal text-center mt-2">
              Les visages derrière l'inspiration quotidienne
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
          {/* Couple Profile Section */}
          <section className="mb-12">
            <CoupleProfile />
          </section>

          {/* Mission Statement Section */}
          <section className="mb-12">
            <MissionStatement />
          </section>

          {/* Journey Story Section */}
          <section className="mb-12">
            <JourneyStory />
          </section>

          {/* Community Impact Section */}
          <section className="mb-12">
            <CommunityImpact />
          </section>

          {/* Contact Information Section */}
          <section className="mb-8">
            <ContactInfo />
          </section>

          {/* Footer Message */}
          <div className="text-center py-8 border-t border-border">
            <p className="text-text-secondary font-body-normal leading-relaxed max-w-2xl mx-auto">
              Merci de faire partie de notre communauté d'inspiration. Ensemble, nous créons un monde plus positif, une affiche à la fois.
            </p>
            <p className="text-sm text-text-secondary font-mono-normal mt-4">
              © {new Date()?.getFullYear()} Daily Posters - Fait avec ❤️ en France
            </p>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomTabNavigation />
      </div>
    </>
  );
};

export default About;