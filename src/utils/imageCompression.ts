import imageCompression from "browser-image-compression";

/**
 * Compresse une image avant upload.
 * - Max 300 KB
 * - Max 1200px de largeur/hauteur
 * - Convertit en WebP pour un meilleur ratio qualité/taille
 * - Qualité visuelle imperceptible (82%)
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3,           // 300 KB max
    maxWidthOrHeight: 1200,   // 1200px max
    useWebWorker: true,       // Ne bloque pas l'interface
    fileType: "image/webp",   // Format moderne
    initialQuality: 0.82,     // Qualité visuelle excellente
    onProgress: undefined,
  };

  try {
    const compressed = await imageCompression(file, options);
    // Renomme le fichier avec l'extension .webp
    const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([compressed], newName, { type: "image/webp" });
  } catch (error) {
    console.warn("Compression échouée, utilisation du fichier original:", error);
    // En cas d'erreur, retourne le fichier original sans bloquer l'upload
    return file;
  }
}
