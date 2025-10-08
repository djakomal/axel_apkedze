import { useState } from 'react';
import Button from '../../../components/ui/Button';

const SocialShareButtons = ({ poster }) => {
  const [shareStates, setShareStates] = useState({
    whatsapp: false,
    facebook: false
  });

  const handleShare = async (platform) => {
    if (!poster) return;

    setShareStates(prev => ({ ...prev, [platform]: true }));

    try {
      const shareText = poster?.title 
        ? `${poster?.title} - Inspiration quotidienne de Daily Posters`
        : 'Inspiration quotidienne de Daily Posters';
      
      const shareUrl = poster?.shareUrl || window.location?.href;

      let shareLink = '';
      
      if (platform === 'whatsapp') {
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
      } else if (platform === 'facebook') {
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        setTimeout(() => {
          setShareStates(prev => ({ ...prev, [platform]: false }));
        }, 1000);
      }
    } catch (error) {
      console.error(`Erreur lors du partage sur ${platform}:`, error);
      setShareStates(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleNativeShare = () => {
    if (navigator.share && poster) {
      navigator.share({
        title: poster?.title || 'Inspiration Quotidienne',
        text: poster?.description || 'Découvrez cette affiche inspirante',
        url: poster?.shareUrl || window.location?.href
      })?.catch(console.error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
      <Button
        variant="outline"
        size="default"
        onClick={() => handleShare('whatsapp')}
        loading={shareStates?.whatsapp}
        iconName="MessageCircle"
        iconPosition="left"
        iconSize={18}
        className="contextual-micro-interaction show text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
      >
        WhatsApp
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={() => handleShare('facebook')}
        loading={shareStates?.facebook}
        iconName="Facebook"
        iconPosition="left"
        iconSize={18}
        className="contextual-micro-interaction show text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
      >
        Facebook
      </Button>
      <Button
        variant="ghost"
        size="default"
        onClick={handleNativeShare}
        iconName="Share2"
        iconPosition="left"
        iconSize={18}
        className="contextual-micro-interaction show text-text-secondary hover:text-text-primary"
      >
        Partager
      </Button>
    </div>
  );
};

export default SocialShareButtons;