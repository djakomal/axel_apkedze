// Service pour gérer le téléchargement d'images

/**
 * Télécharge une image depuis une URL
 * @param {string} imageUrl - URL de l'image à télécharger
 * @param {string} filename - Nom du fichier (optionnel)
 * @returns {Promise<boolean>} - True si le téléchargement a réussi
 */
export const downloadImage = async (imageUrl, filename = null) => {
  try {
    // Générer un nom de fichier si non fourni
    if (!filename) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      filename = `daily-poster-${timestamp}.jpg`;
    }

    // Vérifier si l'URL est valide
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('URL d\'image invalide');
    }

    // Fetch l'image
    const response = await fetch(imageUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Convertir en blob
    const blob = await response.blob();
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return false;
  }
};

/**
 * Télécharge toutes les images d'un poster (pour les posters avec 4 images)
 * @param {Object} poster - Objet poster avec images
 * @returns {Promise<boolean>} - True si tous les téléchargements ont réussi
 */
export const downloadAllPosterImages = async (poster) => {
  try {
    if (!poster) {
      throw new Error('Poster invalide');
    }

    const images = poster.images || [poster.image];
    const title = poster.title || 'poster';
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    
    const downloadPromises = images.map(async (imageUrl, index) => {
      if (!imageUrl) return false;
      
      const filename = images.length > 1 
        ? `${sanitizedTitle}-image-${index + 1}.jpg`
        : `${sanitizedTitle}.jpg`;
      
      return await downloadImage(imageUrl, filename);
    });

    const results = await Promise.all(downloadPromises);
    const successCount = results.filter(Boolean).length;
    
    console.log(`${successCount}/${images.length} images téléchargées avec succès`);
    return successCount === images.length;
  } catch (error) {
    console.error('Erreur lors du téléchargement multiple:', error);
    return false;
  }
};

/**
 * Vérifie si le navigateur supporte le téléchargement
 * @returns {boolean} - True si le téléchargement est supporté
 */
export const isDownloadSupported = () => {
  return typeof document !== 'undefined' && 'download' in document.createElement('a');
};

/**
 * Obtient la taille d'une image depuis son URL
 * @param {string} imageUrl - URL de l'image
 * @returns {Promise<{width: number, height: number}>} - Dimensions de l'image
 */
export const getImageDimensions = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };
    img.src = imageUrl;
  });
};

/**
 * Formate la taille d'un fichier en bytes vers une chaîne lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} - Taille formatée (ex: "1.2 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  downloadImage,
  downloadAllPosterImages,
  isDownloadSupported,
  getImageDimensions,
  formatFileSize
};
