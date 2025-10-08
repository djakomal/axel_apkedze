import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImageUpload = ({ selectedImage, error, onImageSelect }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Validate file type
      if (!file?.type?.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file?.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      onImageSelect(file);
    }
  };

  const handleChooseImage = () => {
    fileInputRef?.current?.click();
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary">
        Upload Poster Image
        <span className="text-destructive ml-1">*</span>
      </label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
          error 
            ? 'border-destructive bg-destructive/5' :'border-border hover:border-primary/50 bg-card'
        }`}
      >
        {selectedImage ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected poster"
                className="max-w-full max-h-48 rounded-md object-cover"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-text-primary font-medium">
                {selectedImage?.name}
              </p>
              <p className="text-xs text-text-secondary">
                {(selectedImage?.size / 1024 / 1024)?.toFixed(2)} MB
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChooseImage}
                  iconName="RefreshCw"
                  iconSize={14}
                >
                  Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  iconName="Trash2"
                  iconSize={14}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Icon 
                  name="Cloud" 
                  size={32} 
                  className="text-primary"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-medium text-text-primary">
                Upload Poster Image
              </h3>
              <p className="text-sm text-text-secondary">
                Tap to select an image from your gallery
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleChooseImage}
              className="bg-input hover:bg-input/80 border-border"
            >
              Choose Image
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};

export default ImageUpload;