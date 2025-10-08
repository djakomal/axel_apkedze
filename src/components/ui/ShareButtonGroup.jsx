import React, { useState } from 'react';

import Button from './Button';

const ShareButtonGroup = ({ poster, variant = 'card', className = '' }) => {
  const [shareStates, setShareStates] = useState({
    whatsapp: false,
    facebook: false
  });

  const handleShare = async (platform) => {
    if (!poster) return;

    // Set loading state
    setShareStates(prev => ({ ...prev, [platform]: true }));

    try {
      const shareText = poster?.title 
        ? `${poster?.title} - Daily inspiration from Daily Posters`
        : 'Daily inspiration from Daily Posters';
      
      const shareUrl = poster?.shareUrl || window.location?.href;

      let shareLink = '';
      
      if (platform === 'whatsapp') {
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
      } else if (platform === 'facebook') {
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        // Show success state briefly
        setTimeout(() => {
          setShareStates(prev => ({ ...prev, [platform]: false }));
        }, 1000);
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      setShareStates(prev => ({ ...prev, [platform]: false }));
    }
  };

  const buttonSize = variant === 'modal' ? 'default' : 'sm';
  const buttonVariant = variant === 'modal' ? 'outline' : 'ghost';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => handleShare('whatsapp')}
        loading={shareStates?.whatsapp}
        iconName="MessageCircle"
        iconPosition="left"
        iconSize={16}
        className="contextual-micro-interaction show text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
        style={{ animationDelay: '0ms' }}
      >
        WhatsApp
      </Button>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => handleShare('facebook')}
        loading={shareStates?.facebook}
        iconName="Facebook"
        iconPosition="left"
        iconSize={16}
        className="contextual-micro-interaction show text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
        style={{ animationDelay: '100ms' }}
      >
        Facebook
      </Button>
      {variant === 'modal' && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => {
            if (navigator.share && poster) {
              navigator.share({
                title: poster?.title || 'Daily Inspiration',
                text: poster?.description || 'Check out this inspirational poster',
                url: poster?.shareUrl || window.location?.href
              })?.catch(console.error);
            }
          }}
          iconName="Share2"
          iconPosition="left"
          iconSize={16}
          className="contextual-micro-interaction show text-text-secondary hover:text-text-primary"
          style={{ animationDelay: '200ms' }}
        >
          Share
        </Button>
      )}
    </div>
  );
};

export default ShareButtonGroup;