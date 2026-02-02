/**
 * Actions pour la gestion des produits
 * @deprecated Importer directement depuis '@/app/actions/products/index'
 *
 * Ce fichier réexporte les actions depuis la nouvelle structure modulaire
 * pour maintenir la compatibilité avec le code existant.
 */

export {
  createProduct,
  createProductFromJSON,
  updateProduct,
  updateProductFromJSON,
  deleteProduct,
  deleteProductById,
} from "./products/index";
