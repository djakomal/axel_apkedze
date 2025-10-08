import { Helmet } from 'react-helmet';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import HistoryHeader from './components/HistoryHeader';
import { useState } from 'react';
import HistoryHeaderEditor from './components/HistoryHeaderEditor';
import HistoryList from './components/HistoryList';

const HistoryPage = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  return (
    <>
      <Helmet>
        <title>Historique des Affiches - Daily Posters</title>
        <meta 
          name="description" 
          content="Redécouvrez nos affiches inspirantes des jours précédents. Parcourez chronologiquement nos messages de bénédiction quotidiens et partagez-les avec votre communauté." 
        />
        <meta name="keywords" content="historique, affiches inspirantes, bénédictions quotidiennes, partage communautaire" />
        <meta property="og:title" content="Historique des Affiches - Daily Posters" />
        <meta property="og:description" content="Parcourez nos affiches inspirantes des jours précédents" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="pb-20 px-4 pt-6 max-w-4xl mx-auto">
          {/* Header Section */}
          <HistoryHeader onEdit={() => setIsEditorOpen(true)} />
          
          {/* History List */}
          <div className="space-y-6">
            <HistoryList />
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomTabNavigation />
      </div>

      {/* Editor Modal */}
      <HistoryHeaderEditor open={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </>
  );
};

export default HistoryPage;