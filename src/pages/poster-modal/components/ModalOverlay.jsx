import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalOverlay = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 bg-black/50 gesture-modal flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ModalOverlay;