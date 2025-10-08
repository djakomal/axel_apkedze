import { supabase } from './supabaseClient';

// Fonction pour compresser une image avant l'upload
const compressImage = async (file, maxSizeMB = 1, maxWidthOrHeight = 1920) => {
  // Si le fichier est déjà petit, ne pas compresser
  if (file.size <= maxSizeMB * 1024 * 1024) {
    console.log('🔍 Image déjà assez petite, pas de compression nécessaire');
    return file;
  }

  return new Promise((resolve, reject) => {
    try {
      console.log('🔄 Début de la compression d\'image...');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Calculer les dimensions pour maintenir le ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Qualité de compression (0.7 = 70%)
          const quality = 0.7;
          
          // Convertir en Blob
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('❌ Échec de la compression');
              resolve(file); // Utiliser l'original en cas d'échec
              return;
            }
            
            // Créer un nouveau fichier à partir du blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            console.log('✅ Compression réussie:', {
              avant: Math.round(file.size / 1024) + 'KB',
              après: Math.round(compressedFile.size / 1024) + 'KB',
              réduction: Math.round((1 - compressedFile.size / file.size) * 100) + '%'
            });
            
            resolve(compressedFile);
          }, file.type, quality);
        };
        
        img.onerror = () => {
          console.error('❌ Erreur lors du chargement de l\'image');
          resolve(file); // Utiliser l'original en cas d'erreur
        };
      };
      
      reader.onerror = () => {
        console.error('❌ Erreur lors de la lecture du fichier');
        resolve(file); // Utiliser l'original en cas d'erreur
      };
    } catch (error) {
      console.error('❌ Erreur lors de la compression:', error);
      resolve(file); // Utiliser l'original en cas d'erreur
    }
  });
};

// Simple retry helper with exponential backoff
async function withRetry(fn, { retries = 3, baseDelayMs = 400 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isAbort = error?.name === 'AbortError';
      const isNetworkLike = /Failed to fetch|NetworkError|TypeError: Failed to fetch|timeout|ETIMEDOUT/i.test(error?.message || '');
      if (attempt === retries || (!isNetworkLike && !isAbort)) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ===== Schema capability detection (config-driven, no probing to avoid 400s) =====
let schemaCapabilities = { checked: false, hasImagesDescriptions: false };

async function ensureSchemaCapabilities() {
  if (schemaCapabilities.checked) return schemaCapabilities;
  try {
    let flag = null;
    
    // Vérifier uniquement les sources disponibles dans le navigateur
    if (typeof window !== 'undefined') {
      // Vérifier window.__APP_CONFIG__
      flag = flag ?? window.__APP_CONFIG__?.HAS_IMAGES_DESCRIPTIONS;
      
      // Vérifier localStorage
      flag = flag ?? window.localStorage?.getItem('HAS_IMAGES_DESCRIPTIONS');
    }
    
    const truthy = String(flag || '').toLowerCase();
    const enabled = truthy === '1' || truthy === 'true' || truthy === 'yes';
    schemaCapabilities = { checked: true, hasImagesDescriptions: Boolean(enabled) };
  } catch (_) {
    schemaCapabilities = { checked: true, hasImagesDescriptions: false };
  }
  return schemaCapabilities;
}

export const uploadImage = async (file) => {
  try {
    console.log('📤 uploadImage appelé avec:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Compresser l'image avant l'upload
    console.log('🔍 Vérification et compression de l\'image si nécessaire...');
    const compressedFile = await compressImage(file, 0.8, 1600);
    
    // Créer un nom de fichier unique avec la date
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    console.log('📁 Chemin de fichier:', filePath);
    console.log('⏳ Début de l\'upload vers Supabase...');

    // Créer une promesse avec timeout pour éviter les blocages infinis
     const uploadWithTimeout = async (timeoutMs = 120000) => { // Augmenté à 2 minutes
       let timeoutId;
       
       const timeoutPromise = new Promise((_, reject) => {
         timeoutId = setTimeout(() => {
           reject(new Error(`Upload timeout après ${timeoutMs/1000} secondes`));
         }, timeoutMs);
       });
       
       try {
         const uploadPromise = withRetry(() => {
            console.log('🔄 Tentative d\'upload...');
            return supabase.storage
              .from('posters')
              .upload(filePath, compressedFile, {
                cacheControl: '3600',
                upsert: true, // Changé à true pour permettre le remplacement
                contentType: compressedFile?.type || 'application/octet-stream',
              });
          }, { retries: 3, baseDelayMs: 1000 }); // Plus de tentatives avec délai plus long
         
         // Race entre l'upload et le timeout
         const result = await Promise.race([uploadPromise, timeoutPromise]);
         clearTimeout(timeoutId);
         return result;
       } catch (error) {
         clearTimeout(timeoutId);
         throw error;
       }
     };

    // Exécuter l'upload avec timeout
    const { data, error } = await uploadWithTimeout();

    if (error) {
      console.error('❌ Erreur upload storage:', error);
      throw error;
    }

    console.log('✅ Upload storage réussi:', data);

    // Obtenir l'URL publique
    console.log('🔍 Récupération de l\'URL publique...');
    const { data: { publicUrl } } = supabase.storage
      .from('posters')
      .getPublicUrl(filePath);
    const finalPublicUrl = publicUrl || `${(typeof window !== 'undefined' && window.__APP_CONFIG__?.VITE_SUPABASE_URL) || (import.meta?.env?.VITE_SUPABASE_URL || '')}/storage/v1/object/public/posters/${filePath}`;

    console.log('🔗 URL publique générée:', finalPublicUrl);

    return { filePath, publicUrl: finalPublicUrl };
  } catch (error) {
    console.error('💥 Erreur dans uploadImage:', error);
    // Fournir plus de détails sur l'erreur
    console.error('📋 Détails de l\'erreur:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }
};

export const deleteImage = async (filePath) => {
  try {
    const { error } = await withRetry(() => supabase.storage
      .from('posters')
      .remove([filePath]));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const updatePoster = async (id, { title, description, images, images_descriptions }) => {
  try {
    console.log('🔧 updatePoster appelé avec:', { id, title, description, images, images_descriptions });
    const { hasImagesDescriptions } = await ensureSchemaCapabilities();
    
    // Toujours récupérer l'état actuel pour fusionner proprement
    const { data: current, error: fetchErr } = await withRetry(() => supabase
      .from('posters')
      .select('id, title, description, image_url, images, file_path, file_paths' + (hasImagesDescriptions ? ', images_descriptions' : ''))
      .eq('id', id)
      .single());
    if (fetchErr) throw fetchErr;

    let updateData = { title, description };

    // Fusion des descriptions d'images
    if (hasImagesDescriptions) {
      const mergedDescriptions = (Array.isArray(images_descriptions) && images_descriptions.length)
        ? images_descriptions
        : (current.images_descriptions || []);
      updateData.images_descriptions = mergedDescriptions;
    }

    // Si images est fourni (même partiellement), fusionner par index
    if (Array.isArray(images) && images.length) {
      console.log('📤 Traitement des images pour mise à jour...');
      const maxLen = Math.max(4, current.images?.length || 0, images.length);
      const mergedUrls = new Array(maxLen).fill(null);
      const mergedPaths = new Array(maxLen).fill(null);

      for (let index = 0; index < maxLen; index++) {
        const candidate = images[index];
        if (candidate instanceof File) {
          console.log(`📷 Upload nouvelle image ${index + 1}:`, candidate.name);
          const result = await uploadImage(candidate);
          mergedUrls[index] = result.publicUrl;
          mergedPaths[index] = result.filePath;
        } else if (typeof candidate === 'string' && candidate) {
          // Garder l'URL fournie telle quelle
          mergedUrls[index] = candidate;
          mergedPaths[index] = (current.file_paths || [])[index] || current.file_path || null;
        } else {
          // Null/undefined => conserver existant
          mergedUrls[index] = (current.images || [current.image_url]).filter(Boolean)[index] || null;
          mergedPaths[index] = (current.file_paths || [current.file_path]).filter(Boolean)[index] || null;
        }
      }

      // Nettoyer: retirer les trous finaux
      const finalUrls = mergedUrls.filter(Boolean).slice(0, 4);
      const finalPaths = mergedPaths.filter(Boolean).slice(0, 4);

      if (finalUrls.length) {
        updateData.images = finalUrls;
        updateData.image_url = finalUrls[0];
      }
      if (finalPaths.length) {
        updateData.file_paths = finalPaths;
        updateData.file_path = finalPaths[0];
      }
    }

    console.log('💾 Mise à jour en base de données:', updateData);
    
    const { data, error } = await withRetry(() => supabase
      .from('posters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single());

    if (error) {
      console.error('❌ Erreur mise à jour base de données:', error);
      throw error;
    }
    
    console.log('✅ Poster mis à jour avec succès:', data);
    return data;
  } catch (error) {
    console.error('💥 Erreur dans updatePoster:', error);
    throw error;
  }
};

export const deletePoster = async (id, filePath, filePaths) => {
  try {
    // Récupérer les chemins si non fournis
    let pathsToDelete = filePaths || (filePath ? [filePath] : []);
    if (!pathsToDelete || pathsToDelete.length === 0) {
      try {
        const { data: poster, error: fetchError } = await withRetry(() => supabase
          .from('posters')
          .select('file_path, file_paths')
          .eq('id', id)
          .single());
        if (!fetchError && poster) {
          pathsToDelete = poster.file_paths || (poster.file_path ? [poster.file_path] : []);
        }
      } catch (_) {
        // ignore fetch issues for paths; we'll still attempt DB delete
      }
    }

    // Supprimer toutes les images du stockage (meilleure tolérance aux erreurs)
    if (pathsToDelete && pathsToDelete.length > 0) {
      await Promise.all(pathsToDelete.map(async (path) => {
        try {
          await deleteImage(path);
        } catch (err) {
          // Ignore erreurs de type fichier manquant/404, log les autres
          const msg = String(err?.message || '');
          if (!/Not Found|404|does not exist|Object not found/i.test(msg)) {
            console.warn('Storage remove warning for', path, err);
          }
        }
      }));
    }

    // Supprimer l'entrée de la base de données (toujours tenter)
    const { error } = await withRetry(() => supabase
      .from('posters')
      .delete()
      .eq('id', id));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting poster:', error);
    throw error;
  }
};

export const createPoster = async ({ title, description, images, images_descriptions }) => {
  try {
    console.log('🔧 createPoster appelé avec:', { title, description, images });
    const { hasImagesDescriptions } = await ensureSchemaCapabilities();
    
    // Vérifier que nous avons des images
    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error(`Au moins une image est requise, ${images?.length || 0} fournies`);
    }
    
    // Limiter à 4 images maximum
    const imagesToProcess = images.slice(0, 4);
    
    // Vérifier que les images sont valides
    const validImages = imagesToProcess.filter(img => img !== null && img !== undefined);
    if (validImages.length === 0) {
      throw new Error(`Au moins une image valide est requise`);
    }
    
    console.log('📤 Début upload des images...');
    
    // Upload des images
    const uploadedResults = [];
    let uploadError = null;
    
    try {
      for (let index = 0; index < validImages.length; index++) {
        const image = validImages[index];
        if (image) {
          console.log(`📷 Upload image ${index + 1}:`, image.name || 'Sans nom');
          try {
            const result = await uploadImage(image);
            console.log(`✅ Image ${index + 1} uploadée:`, result.publicUrl);
            uploadedResults.push(result);
          } catch (err) {
            console.error(`❌ Échec upload image ${index + 1}:`, err);
            // Continuer avec les autres images au lieu d'échouer complètement
          }
        }
      }
    } catch (uploadErr) {
      console.error('❌ Upload échoué, rollback des fichiers déjà uploadés');
      uploadError = uploadErr;
      // Continuer pour essayer de sauvegarder avec les images déjà uploadées
    }

    const imageUrls = uploadedResults.map(upload => upload?.publicUrl).filter(Boolean);
    const filePaths = uploadedResults.map(upload => upload?.filePath).filter(Boolean);
    
    console.log('📊 Résultats upload:', {
      imageUrls: imageUrls.length,
      filePaths: filePaths.length
    });

    // Si aucune image n'a été uploadée avec succès, échouer
    if (imageUrls.length === 0) {
      // Nettoyer les fichiers partiellement uploadés
      const pathsToDelete = uploadedResults.map(r => r?.filePath).filter(Boolean);
      if (pathsToDelete.length) {
        try {
          await Promise.all(pathsToDelete.map(p => deleteImage(p)));
        } catch (rollbackErr) {
          console.warn('⚠️ Échec rollback partiel du storage:', rollbackErr);
        }
      }
      throw uploadError || new Error('Aucune image n\'a pu être uploadée');
    }

    // Créer l'entrée dans la base de données
    const posterData = {
      title,
      description,
      image_url: imageUrls[0], // URL principale pour compatibilité
      images: imageUrls, // Toutes les URLs
      file_path: filePaths[0], // Chemin principal pour compatibilité
      file_paths: filePaths, // Tous les chemins
      created_at: new Date().toISOString()
    };
    
    // Ajouter les descriptions d'images si disponibles
    if (hasImagesDescriptions && Array.isArray(images_descriptions)) {
      // S'assurer que nous n'avons pas plus de descriptions que d'images
      const validDescriptions = images_descriptions
        .slice(0, imageUrls.length)
        .filter(desc => desc !== null && desc !== undefined);
      
      if (validDescriptions.length > 0) {
        posterData.images_descriptions = validDescriptions;
      }
    }
    
    console.log('💾 Insertion en base de données:', posterData);
    
    try {
      const { data, error } = await withRetry(() => supabase
        .from('posters')
        .insert(posterData)
        .select()
        .single());

      if (error) {
        console.error('❌ Erreur insertion base de données:', error);
        throw error;
      }
      
      console.log('✅ Poster créé avec succès:', data);
      return data;
    } catch (dbError) {
      console.error('💥 Erreur lors de l\'insertion en base de données:', dbError);
      
      // Nettoyer les fichiers uploadés en cas d'échec de l'insertion
      if (filePaths.length > 0) {
        try {
          await Promise.all(filePaths.map(p => deleteImage(p)));
        } catch (cleanupErr) {
          console.warn('⚠️ Échec du nettoyage des images après échec d\'insertion:', cleanupErr);
        }
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('💥 Erreur dans createPoster:', error);
    throw error;
  }
};

export const getPosters = async () => {
  try {
    const { data, error } = await withRetry(() => supabase
      .from('posters')
      .select('*')
      .order('created_at', { ascending: false }));

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching posters:', error);
    throw error;
  }
};

// Récupérer uniquement les posters d'aujourd'hui (max 4)
export const getTodayPosters = async (limit = 4) => {
  try {
    const { hasImagesDescriptions } = await ensureSchemaCapabilities();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const baseColumns = ['id','title','description','image_url','images','file_path','file_paths','created_at'];
    const columns = hasImagesDescriptions ? [...baseColumns, 'images_descriptions'] : baseColumns;
    const { data, error } = await withRetry(() => supabase
      .from('posters')
      .select(columns.join(','))
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit));

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching today posters:', error);
    throw error;
  }
};
// Incrémente une métrique (views_count | downloads_count | shares_count)
export const incrementPosterMetric = async (posterId, metric) => {
  try {
    if (!['views_count', 'downloads_count', 'shares_count'].includes(metric)) {
      throw new Error('Metric invalide');
    }

    // Utiliser directement la fonction RPC
    const { error: rpcError } = await supabase.rpc('increment_poster_metric', {
      p_poster_id: posterId,
      p_metric: metric
    });
    
    if (rpcError) {
      console.error('RPC error:', rpcError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing metric:', error);
    return false;
  }
};

// Récupérer les posters avec pagination pour l'historique
export const getPostersHistory = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await withRetry(() => supabase
      .from('posters')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1));

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching posters history:', error);
    throw error;
  }
};

// Récupérer les posters groupés par date pour l'historique
export const getPostersGroupedByDate = async (limit = 30) => {
  try {
    const { data, error } = await withRetry(() => supabase
      .from('posters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit * 4)); // Assumer 4 posters par jour maximum

    if (error) throw error;

    // Grouper par date
    const groupedData = {};
    data.forEach(poster => {
      const date = new Date(poster.created_at).toDateString();
      if (!groupedData[date]) {
        groupedData[date] = [];
      }
      groupedData[date].push(poster);
    });

    // Convertir en format attendu par l'interface
    return Object.entries(groupedData).map(([dateString, posters]) => ({
      date: new Date(dateString).toISOString(),
      posters: posters.map(poster => ({
        id: poster.id,
        title: poster.title,
        image: poster.images?.[0] || poster.image_url,
        images: poster.images || [poster.image_url],
        description: poster.description,
        date: poster.created_at,
        shareUrl: `${window.location.origin}/poster/${poster.id}`
      }))
    }));
  } catch (error) {
    console.error('Error fetching grouped posters:', error);
    throw error;
  }
};

// Récupérer les posters groupés par jour pour les N derniers jours (par date calendrier)
export const getPostersGroupedForLastNDays = async (days = 3) => {
  try {
    const { hasImagesDescriptions } = await ensureSchemaCapabilities();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - (days - 1)); // inclut aujourd'hui

    const baseColumns = ['id','title','description','image_url','images','file_path','file_paths','created_at'];
    const columns = hasImagesDescriptions ? [...baseColumns, 'images_descriptions'] : baseColumns;
    const { data, error } = await withRetry(() => supabase
      .from('posters')
      .select(columns.join(','))
      .gte('created_at', start.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: false }));

    if (error) throw error;

    const grouped = data.reduce((acc, poster) => {
      const key = new Date(poster.created_at).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(poster);
      return acc;
    }, {});

    // Trier les dates desc et ne garder que les N plus récentes
    const sortedDateKeys = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, days);

    return sortedDateKeys.map((dateString) => ({
      date: new Date(dateString).toISOString(),
      posters: grouped[dateString].map((poster) => ({
        id: poster.id,
        title: poster.title,
        image: poster.images?.[0] || poster.image_url,
        images: poster.images || [poster.image_url],
        description: poster.description,
        date: poster.created_at,
        shareUrl: `${window.location.origin}/poster/${poster.id}`
      }))
    }));
  } catch (error) {
    console.error('Error fetching last N days grouped posters:', error);
    throw error;
  }
};

// ===== App settings (history header) =====
export const getHistoryHeaderSettings = async () => {
  try {
    const { data, error } = await withRetry(() => supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'history_header')
      .single());

    if (error && error.code !== 'PGRST116') throw error; // not found
    return data?.value || null;
  } catch (error) {
    console.error('Error fetching history header settings:', error);
    return null;
  }
};

export const upsertHistoryHeaderSettings = async (value) => {
  try {
    const payload = { key: 'history_header', value };
    const { error } = await withRetry(() => supabase
      .from('app_settings')
      .upsert(payload, { onConflict: 'key' }));
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving history header settings:', error);
    return false;
  }
};

// Supprimer un poster spécifique (pour l'historique)
export const deleteHistoryPoster = async (posterId) => {
  try {
    // Récupérer d'abord les informations du poster
    const { data: poster, error: fetchError } = await withRetry(() => supabase
      .from('posters')
      .select('file_path, file_paths')
      .eq('id', posterId)
      .single());

    if (fetchError) throw fetchError;

    // Supprimer les images du stockage
    const pathsToDelete = poster.file_paths || (poster.file_path ? [poster.file_path] : []);
    if (pathsToDelete.length > 0) {
      await Promise.all(
        pathsToDelete.map(path => deleteImage(path))
      );
    }

    // Supprimer l'entrée de la base de données
    const { error } = await withRetry(() => supabase
      .from('posters')
      .delete()
      .eq('id', posterId));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting history poster:', error);
    throw error;
  }
};

// Supprimer tous les posters d'une date donnée
export const deleteHistoryEntry = async (targetDate) => {
  try {
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    // Récupérer les posters de cette date
    const { data: posters, error: fetchError } = await withRetry(() => supabase
      .from('posters')
      .select('id, file_path, file_paths')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()));

    if (fetchError) throw fetchError;

    // Supprimer toutes les images du stockage
    for (const poster of posters) {
      const pathsToDelete = poster.file_paths || (poster.file_path ? [poster.file_path] : []);
      if (pathsToDelete.length > 0) {
        await Promise.all(
          pathsToDelete.map(path => deleteImage(path))
        );
      }
    }

    // Supprimer toutes les entrées de la base de données
    const { error } = await withRetry(() => supabase
      .from('posters')
      .delete()
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting history entry:', error);
    throw error;
  }
};