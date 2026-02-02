/**
 * Actions pour la gestion des senteurs
 * @deprecated Importer directement depuis '@/app/actions/scents/index'
 *
 * Ce fichier réexporte les actions depuis la nouvelle structure modulaire
 * pour maintenir la compatibilité avec le code existant.
 */

export {
  createScent,
  createScentFromJSON,
  updateScent,
  updateScentFromJSON,
  deleteScent,
  deleteScentById,
} from "./scents/index";
