import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import DailyStats from './components/DailyStats';
import FeatureHighlights from './components/FeatureHighlights';
import WelcomeHero from './components/WelcomeHero';
import { getTodayPosters } from '../../utils/posterService';
import useRealtimePosters from '../../hooks/useRealtimePosters';

const HomePage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [homePosters, setHomePosters] = useState([]);
  const [loadingPosters, setLoadingPosters] = useState(false);

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguage = localStorage.getItem('dailyPostersLanguage') || 'fr';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPosters(true);
        const data = await getTodayPosters(4);
        const posters = (data || []).flatMap((poster) => {
          const images = Array.isArray(poster.images) && poster.images.length > 0 ? poster.images : (poster.image_url ? [poster.image_url] : []);
          if (images.length > 1) {
            return images.slice(0, 4).map((imgUrl, idx) => ({
              id: `${poster.id}-${idx+1}`,
              title: poster.title,
              description: poster.images_descriptions?.[idx] || poster.description,
              image: imgUrl,
            }));
          }
          return [{ id: poster.id, title: poster.title, description: poster.description, image: images[0] }];
        }).slice(0, 4);
        setHomePosters(posters);
      } catch (e) {
        setHomePosters([]);
      } finally {
        setLoadingPosters(false);
      }
    };
    load();
  }, []);

  // Recharger quand un poster est ajouté/mis à jour/supprimé (realtime)
  useRealtimePosters(({ eventType }) => {
    if (['INSERT', 'UPDATE', 'DELETE'].includes(eventType)) {
      // recharger silencieusement
      (async () => {
        try {
          const data = await getTodayPosters(4);
          const posters = (data || []).flatMap((poster) => {
            const images = Array.isArray(poster.images) && poster.images.length > 0 ? poster.images : (poster.image_url ? [poster.image_url] : []);
            // Toujours créer une carte par image avec sa description correspondante
            return images.slice(0, 4).map((imgUrl, idx) => ({
              id: `${poster.id}-${idx+1}`,
              title: poster.title,
              description: poster.images_descriptions?.[idx] || poster.description,
              image: imgUrl,
            }));
          }).slice(0, 4);
          setHomePosters(posters);
        } catch {}
      })();
    }
  });

  return (
    <>
      <Helmet>
        <title>Accueil - Daily Posters | Inspiration Quotidienne</title>
        <meta 
          name="description" 
          content="Découvrez Daily Posters, votre source quotidienne d'inspiration. Nous partageons 4 affiches motivantes chaque jour pour bénir notre communauté." 
        />
        <meta name="keywords" content="inspiration quotidienne, affiches motivantes, bénédictions, communauté, partage" />
        <meta property="og:title" content="Daily Posters - Inspiration Quotidienne" />
        <meta property="og:description" content="Partagez l'inspiration quotidienne avec notre communauté bienveillante" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/home" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="pb-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <WelcomeHero />
          </section>

          {/* Feature Highlights Section */}
          <section>
            <FeatureHighlights />
          </section>

          {/* Daily Stats Section */}
          <section>
            <DailyStats />
          </section>

          {/* Today Preview Section */}
        

          {/* Inspirational Quote Section */}
          <section className="py-16 px-6 bg-background">
            <div className="max-w-3xl mx-auto text-center">
              <div className="contextual-micro-interaction show" style={{ animationDelay: '200ms' }}>
                <blockquote className="text-xl md:text-2xl font-heading-medium text-text-primary leading-relaxed mb-6 italic">
                  "Chaque jour est une nouvelle opportunité de répandre la joie et l'inspiration dans le monde."
                </blockquote>
                <cite className="text-text-secondary font-body-normal">
                  -- L'équipe Axel-Apkedze --
                </cite>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <BottomTabNavigation />
      </div>
    </>
  );
};

export default HomePage;