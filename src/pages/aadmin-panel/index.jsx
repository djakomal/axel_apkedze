import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoster, updatePoster, deletePoster, getPosters } from '../../utils/posterService';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import PosterForm from './components/PosterForm';
import useRealtimePosters from '../../hooks/useRealtimePosters';

const AadminPanel = () => {
  const navigate = useNavigate();
  const [posters, setPosters] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [null, null, null, null],
    images_descriptions: ['', '', '', '']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'

  useEffect(() => {
    loadPosters();
  }, []);

  // Gérer les mises à jour en temps réel
  const handleRealtimeUpdate = useCallback(({ eventType, new: newRecord, old: oldRecord }) => {
    console.log('Admin Panel - Mise à jour temps réel:', eventType, newRecord, oldRecord);
    
    switch (eventType) {
      case 'INSERT':
        setPosters(prev => [newRecord, ...prev]);
        break;
        
      case 'UPDATE':
        setPosters(prev => prev.map(poster => 
          poster.id === newRecord.id ? newRecord : poster
        ));
        break;
        
      case 'DELETE':
        setPosters(prev => prev.filter(poster => poster.id !== oldRecord.id));
        break;
        
      default:
        console.log('Événement non géré:', eventType);
    }
  }, []);

  // Abonnement aux mises à jour en temps réel
  const { isConnected } = useRealtimePosters(handleRealtimeUpdate);

  const loadPosters = async () => {
    try {
      const data = await getPosters();
      setPosters(data);
    } catch (error) {
      console.error('Erreur lors du chargement des posters:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleImageChange = (index, file) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = file;
      return {
        ...prev,
        images: newImages
      };
    });
    
    if (errors?.images) {
      setErrors(prev => ({
        ...prev,
        images: null
      }));
    }
  };

  const handleDescriptionChange = (index, value) => {
    setFormData(prev => {
      const newDescriptions = [...prev.images_descriptions];
      newDescriptions[index] = value;
      return {
        ...prev,
        images_descriptions: newDescriptions
      };
    });
    
    if (errors?.images_descriptions) {
      setErrors(prev => ({
        ...prev,
        images_descriptions: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.title?.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData?.description?.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    // Vérifier que les 4 images sont présentes
    const validImages = formData?.images?.filter(img => img !== null);
    if (validImages?.length !== 4) {
      newErrors.images = "Les 4 images sont requises";
    }
    
    // Vérifier que les 4 descriptions sont présentes
    const validDescriptions = formData?.images_descriptions?.filter(desc => desc?.trim());
    if (validDescriptions?.length !== 4) {
      newErrors.images_descriptions = "Les 4 descriptions d'images sont requises";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    console.log('🚀 Début de soumission du formulaire');
    console.log('📝 Données du formulaire:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validation échouée');
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage("");
    const timeoutId = setTimeout(() => {
      // Sécurité: si la requête traîne trop, on libère le bouton
      setIsSubmitting(false);
    }, 30000);
    
    try {
      if (mode === 'create') {
        console.log('➕ Mode création - Appel createPoster');
        const result = await createPoster(formData);
        console.log('✅ Poster créé avec succès:', result);
        setSuccessMessage('Poster créé avec succès.');
      } else if (mode === 'edit' && selectedPoster) {
        console.log('✏️ Mode édition - Appel updatePoster');
        const result = await updatePoster(selectedPoster.id, formData);
        console.log('✅ Poster mis à jour avec succès:', result);
        setSuccessMessage('Poster mis à jour avec succès.');
      }
      
      // Réinitialiser le formulaire et recharger la liste
      setFormData({
        title: '',
        description: '',
        images: [null, null, null, null],
        images_descriptions: ['', '', '', '']
      });
      setMode('list');
      setSelectedPoster(null);
      
      console.log('🔄 Rechargement de la liste des posters');
      await loadPosters();
      
      console.log('🎉 Processus terminé avec succès');
      
    } catch (error) {
      console.error('💥 Erreur lors de la soumission:', error);
      console.error('📋 Détails de l\'erreur:', {
        message: error.message,
        stack: error.stack,
        formData: formData
      });
      alert(`Une erreur s'est produite: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const handleEdit = (poster) => {
    console.log('✏️ Édition du poster:', poster);
    setSelectedPoster(poster);
    setFormData({
      title: poster.title,
      description: poster.description,
      images: poster.images || [poster.image_url, null, null, null],
      images_descriptions: poster.images_descriptions || ['', '', '', '']
    });
    setMode('edit');
    console.log('📝 Données du formulaire remplies:', {
      title: poster.title,
      description: poster.description,
      images: poster.images,
      images_descriptions: poster.images_descriptions
    });
  };

  const handleDelete = async (poster) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce poster ?')) {
      try {
        await deletePoster(poster.id, poster.file_path, poster.file_paths);
        await loadPosters();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert("Une erreur s'est produite lors de la suppression.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {mode === 'list' ? 'Gestion des Posters' : mode === 'edit' ? 'Modifier le Poster' : 'Nouveau Poster'}
            </h1>
            {mode === 'list' && (
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Temps réel actif' : 'Hors ligne'}
                </span>
              </div>
            )}
          </div>
          {mode === 'list' ? (
            <Button onClick={() => setMode('create')}>
              <Icon name="Plus" size={20} className="mr-2" />
              Nouveau
            </Button>
          ) : (
            <Button onClick={() => {
              setMode('list');
              setSelectedPoster(null);
              setFormData({ title: '', description: '', images: [null, null, null, null] });
            }}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Retour
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded p-3 text-sm">
              {successMessage}
            </div>
          )}
          {mode === 'list' ? (
            <div className="space-y-4">
              {posters.map(poster => (
                <div key={poster.id} className="bg-card border border-border rounded-lg p-4">
                  {/* Affichage des images */}
                  <div className="mb-4">
                    {poster.images && poster.images.length > 1 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {poster.images.slice(0, 4).map((imageUrl, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={imageUrl}
                              alt={`${poster.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={poster.image_url}
                          alt={poster.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary mb-2">{poster.title}</h3>
                  <p className="text-sm text-text-secondary mb-4">{poster.description}</p>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleEdit(poster)} className="flex-1">
                      <Icon name="Edit" size={20} className="mr-2" />
                      Modifier
                    </Button>
                    <Button onClick={() => handleDelete(poster)} className="flex-1 bg-destructive hover:bg-destructive/90">
                      <Icon name="Trash" size={20} className="mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
              {posters.length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                  Aucun poster n'a été créé
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <PosterForm
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
                onDescriptionChange={handleDescriptionChange}
                onSubmit={handleSubmit}
                editMode={mode === 'edit'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AadminPanel;