/**
 * Utilitaire pour la génération sécurisée de codes QR
 */

/**
 * Génère un code QR unique et cryptographiquement sécurisé
 * Utilise crypto.randomUUID() au lieu de Math.random() pour la sécurité
 * @returns Un code unique de 24 caractères
 */
export function generateSecureQRCode(): string {
  // Utiliser crypto.randomUUID() qui est cryptographiquement sécurisé
  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
  // On prend les parties sans les tirets pour un code plus court mais toujours sécurisé
  const uuid = crypto.randomUUID();
  return uuid.replace(/-/g, "").substring(0, 24);
}

/**
 * Valide le format d'un code QR
 * @param code Le code à valider
 * @returns true si le code est valide
 */
export function isValidQRCode(code: string): boolean {
  // Doit être une chaîne alphanumerique de 13-24 caractères
  // (13 pour rétrocompatibilité avec les anciens codes Math.random())
  return /^[a-z0-9]{13,24}$/i.test(code);
}
