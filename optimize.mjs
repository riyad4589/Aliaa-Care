import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = './src/assets';

async function optimizeImages() {
  if (!fs.existsSync(assetsDir)) {
    console.error(`❌ Le dossier ${assetsDir} n'existe pas.`);
    return;
  }

  // Lecture de tous les fichiers du dossier assets
  const files = fs.readdirSync(assetsDir);
  
  console.log("🚀 Lancement de l'optimisation globale des images...");

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(assetsDir, file);
    
    // On ne traite que les formats classiques
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const outputName = file.replace(ext, '.webp');
      const outputPath = path.join(assetsDir, outputName);
      
      console.log(`📸 Traitement de : ${file} -> ${outputName}`);
      
      try {
        await sharp(filePath)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }) // Redimensionnement intelligent
          .webp({ quality: 75, effort: 6 }) // Compression WebP optimisée
          .toFile(outputPath);
          
        console.log(`✅ Succès : ${outputName}`);
      } catch (err) {
        console.error(`❌ Erreur sur ${file}:`, err);
      }
    }
  }
}

optimizeImages().then(() => {
  console.log('---');
  console.log('🎉 Toutes les images ont été traitées !');
  console.log('💡 Pensez à mettre à jour vos imports .jpeg/.png en .webp dans votre code.');
});
