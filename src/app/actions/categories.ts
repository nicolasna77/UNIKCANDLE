/**
 * Actions pour la gestion des catégories
 * @deprecated Importer directement depuis '@/app/actions/categories/index'
 *
 * Ce fichier réexporte les actions depuis la nouvelle structure modulaire
 * pour maintenir la compatibilité avec le code existant.
 */

export {
  createCategory,
  createCategoryFromJSON,
  updateCategory,
  updateCategoryFromJSON,
  deleteCategory,
  deleteCategoryById,
  type DeleteCategoryResponse,
} from "./categories/index";
