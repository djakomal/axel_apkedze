import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
          aria-label="Go back"
        >
          <Icon 
            name="ArrowLeft" 
            size={20} 
            className="text-text-primary"
          />
        </button>
        
        <h1 className="text-lg font-semibold text-text-primary font-inter">
          Admin Panel
        </h1>
        
        <div className="w-9 h-9" /> {/* Spacer for centered title */}
      </div>
    </header>
  );
};

export default AdminHeader;