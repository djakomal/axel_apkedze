// Script de test pour les fonctionnalités de téléchargement
// À exécuter dans la console du navigateur

console.log('🧪 Test des fonctionnalités de téléchargement...\n');

// Test 1: Vérifier le support du téléchargement
console.log('1️⃣ Test du support navigateur...');
const downloadSupported = 'download' in document.createElement('a');
console.log(`✅ Support téléchargement: ${downloadSupported ? 'OUI' : 'NON'}`);

// Test 2: Vérifier l'existence des services
console.log('\n2️⃣ Test des services...');
try {
  // Ces imports ne fonctionneront que si les modules sont chargés
  console.log('📦 Services de téléchargement: Vérification en cours...');
  
  // Vérifier si les fonctions sont disponibles dans le contexte global
  const hasDownloadService = typeof window.downloadImage === 'function' || 
                            document.querySelector('[data-download-button]') !== null;
  
  console.log(`✅ Services disponibles: ${hasDownloadService ? 'OUI' : 'À VÉRIFIER'}`);
} catch (error) {
  console.warn('⚠️ Impossible de vérifier les services:', error.message);
}

// Test 3: Vérifier la présence des boutons de téléchargement
console.log('\n3️⃣ Test de l\'interface utilisateur...');

const downloadButtons = document.querySelectorAll('[title*="Télécharger"], [aria-label*="download"], button:has(svg[data-lucide="download"])');
console.log(`📱 Boutons de téléchargement trouvés: ${downloadButtons.length}`);

if (downloadButtons.length > 0) {
  console.log('✅ Interface de téléchargement: PRÉSENTE');
  downloadButtons.forEach((btn, index) => {
    console.log(`   - Bouton ${index + 1}: ${btn.textContent.trim() || 'Icône seulement'}`);
  });
} else {
  console.log('⚠️ Interface de téléchargement: À VÉRIFIER');
  console.log('💡 Assurez-vous d\'être sur une page avec des posters');
}

// Test 4: Vérifier les images disponibles
console.log('\n4️⃣ Test des images disponibles...');
const images = document.querySelectorAll('img[src*="http"]');
const validImages = Array.from(images).filter(img => 
  img.src && 
  !img.src.includes('data:') && 
  img.complete && 
  img.naturalWidth > 0
);

console.log(`🖼️ Images valides trouvées: ${validImages.length}`);
if (validImages.length > 0) {
  console.log('✅ Images téléchargeables: DISPONIBLES');
  validImages.slice(0, 3).forEach((img, index) => {
    console.log(`   - Image ${index + 1}: ${img.alt || 'Sans titre'} (${img.naturalWidth}x${img.naturalHeight})`);
  });
} else {
  console.log('⚠️ Images téléchargeables: AUCUNE TROUVÉE');
}

// Test 5: Simuler un téléchargement (fonction utilitaire)
console.log('\n5️⃣ Fonction de test de téléchargement...');
window.testDownload = function(imageUrl = null) {
  console.log('🔄 Test de téléchargement en cours...');
  
  // Utiliser la première image trouvée si aucune URL fournie
  const testUrl = imageUrl || (validImages[0] && validImages[0].src);
  
  if (!testUrl) {
    console.error('❌ Aucune image disponible pour le test');
    return false;
  }
  
  try {
    // Créer un lien de téléchargement de test
    const link = document.createElement('a');
    link.href = testUrl;
    link.download = `test-download-${Date.now()}.jpg`;
    
    // Simuler le clic (ne télécharge pas réellement)
    console.log(`✅ Test réussi - URL: ${testUrl.substring(0, 50)}...`);
    console.log(`📁 Nom de fichier: ${link.download}`);
    
    // Décommenter la ligne suivante pour télécharger réellement
    // document.body.appendChild(link); link.click(); document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
};

// Test 6: Vérifier les métadonnées des posters
console.log('\n6️⃣ Test des métadonnées des posters...');
const posterElements = document.querySelectorAll('[data-poster-id], .poster-card, [class*="poster"]');
console.log(`📋 Éléments poster trouvés: ${posterElements.length}`);

// Test 7: Vérifier la connectivité réseau
console.log('\n7️⃣ Test de connectivité...');
if (navigator.onLine) {
  console.log('✅ Connexion réseau: ACTIVE');
} else {
  console.log('⚠️ Connexion réseau: HORS LIGNE');
}

// Résumé final
console.log('\n📋 RÉSUMÉ DES TESTS:');
console.log(`✅ Support navigateur: ${downloadSupported ? 'OK' : 'KO'}`);
console.log(`✅ Boutons interface: ${downloadButtons.length > 0 ? 'OK' : 'À vérifier'}`);
console.log(`✅ Images disponibles: ${validImages.length > 0 ? 'OK' : 'À vérifier'}`);
console.log(`✅ Connectivité: ${navigator.onLine ? 'OK' : 'KO'}`);

console.log('\n🎯 INSTRUCTIONS:');
console.log('1. Pour tester un téléchargement: testDownload()');
console.log('2. Pour tester avec une URL spécifique: testDownload("https://example.com/image.jpg")');
console.log('3. Vérifiez que vous êtes sur une page avec des posters');
console.log('4. Cherchez les boutons avec l\'icône de téléchargement');

console.log('\n✨ Test terminé !');

// Retourner un objet de résultats pour usage programmatique
window.downloadTestResults = {
  browserSupport: downloadSupported,
  downloadButtons: downloadButtons.length,
  validImages: validImages.length,
  online: navigator.onLine,
  testFunction: window.testDownload
};
