/**
 * Actions pour la gestion des retours
 * @deprecated Importer directement depuis '@/app/actions/returns/index'
 *
 * Ce fichier réexporte les actions depuis la nouvelle structure modulaire
 * pour maintenir la compatibilité avec le code existant.
 */

export {
  createReturn,
  updateReturnStatus,
  updateReturnTracking,
  processRefund,
  deleteReturn,
} from "./returns/index";
