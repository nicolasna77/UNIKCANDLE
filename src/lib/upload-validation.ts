/**
 * Utilitaires de validation pour les uploads de fichiers
 */

// Tailles maximales en bytes
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

// Types MIME autorisés
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/m4a",
  "audio/x-m4a",
];

// Extensions autorisées
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
export const ALLOWED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".webm", ".ogg", ".m4a"];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valide un fichier image
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_IMAGE_SIZE
): ValidationResult {
  // Vérifier la taille
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`,
    };
  }

  // Vérifier le type MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  // Vérifier l'extension
  const extension = getFileExtension(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extension de fichier non autorisée. Extensions acceptées: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Valide un fichier audio
 */
export function validateAudioFile(
  file: File,
  maxSize: number = MAX_AUDIO_SIZE
): ValidationResult {
  // Vérifier la taille
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`,
    };
  }

  // Vérifier le type MIME (plus permissif pour l'audio car les navigateurs varient)
  if (!file.type.startsWith("audio/")) {
    return {
      valid: false,
      error: "Le fichier doit être un fichier audio",
    };
  }

  // Vérifier l'extension
  const extension = getFileExtension(file.name).toLowerCase();
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extension de fichier non autorisée. Extensions acceptées: ${ALLOWED_AUDIO_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Extrait l'extension d'un nom de fichier
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.substring(lastDot);
}

/**
 * Génère un nom de fichier sécurisé et unique
 */
export function generateSecureFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().substring(0, 8);
  const extension = getFileExtension(originalName).toLowerCase();

  // Nettoyer le nom de fichier (supprimer caractères spéciaux)
  const baseName = originalName
    .substring(0, originalName.lastIndexOf(".") || originalName.length)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 50); // Limiter la longueur

  return `${timestamp}-${randomSuffix}-${baseName}${extension}`;
}
