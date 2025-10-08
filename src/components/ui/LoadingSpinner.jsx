import React, { memo } from 'react';

const LoadingSpinner = memo(({ 
  size = 'md', 
  text = 'Chargement...', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
      {showText && text && (
        <p className="text-text-secondary mt-2 text-sm">{text}</p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
