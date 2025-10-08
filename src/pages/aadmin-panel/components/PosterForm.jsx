import React, { useRef } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PosterForm = ({ 
  formData, 
  errors, 
  isSubmitting, 
  onInputChange,
  onImageChange,
  onDescriptionChange,
  onSubmit,
  editMode
}) => {
  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          label="Titre du poster"
          type="text"
          value={formData?.title || ''}
          placeholder="Entrez le titre"
          required
          error={errors?.title}
          disabled={isSubmitting}
          onChange={(e) => onInputChange('title', e?.target?.value)}
          className="bg-input border-border focus:bg-background focus:border-ring"
        />
      </div>
      <div>
        <label 
          htmlFor="poster-description"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Description
          <span className="text-destructive ml-1">*</span>
        </label>
        <textarea
          id="poster-description"
          value={formData?.description || ''}
          placeholder="Entrez la description"
          required
          disabled={isSubmitting}
          onChange={(e) => onInputChange('description', e?.target?.value)}
          className="w-full h-24 px-3 py-2 bg-input border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {errors?.description && (
          <p className="text-sm text-destructive mt-1">
            {errors?.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Images (4 requises) et descriptions (une par image)
          <span className="text-destructive ml-1">*</span>
        </label>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-2">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
                  {formData?.images?.[index] ? (
                    <>
                      <img
                        src={formData.images[index] instanceof File ? URL.createObjectURL(formData.images[index]) : formData.images[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onImageChange(index, null)}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Icon name="ImagePlus" size={24} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Image {index + 1}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Description par image */}
                <textarea
                  value={formData?.images_descriptions?.[index] || ''}
                  placeholder={`Description de l'image ${index + 1}`}
                  disabled={isSubmitting}
                  onChange={(e) => onDescriptionChange(index, e.target.value)}
                  className="w-full h-16 px-3 py-2 bg-input border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <input
                  ref={fileInputRefs[index]}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageChange(index, e.target.files[0])}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRefs[index].current?.click()}
                  disabled={isSubmitting}
                  className="w-full text-xs py-2"
                  variant="outline"
                >
                  {formData?.images?.[index] ? "Changer" : "Ajouter"}
                </Button>
              </div>
            ))}
          </div>
        </div>
        {errors?.images && (
          <p className="text-sm text-destructive mt-1">
            {errors?.images}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting 
          ? 'Enregistrement...' 
          : editMode 
            ? 'Mettre à jour le poster'
            : 'Créer le poster'
        }
      </Button>
    </form>
  );
};

export default PosterForm;