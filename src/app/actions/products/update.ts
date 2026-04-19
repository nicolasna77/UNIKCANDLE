"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productUpdateSchema } from "@/lib/admin-schemas";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Mettre à jour un produit via FormData
 */
export async function updateProduct(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const productId = formData.get("id") as string;

    if (!productId) {
      return errorResponse("ID du produit manquant");
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return errorResponse("Produit introuvable");
    }

    const rawData = {
      id: productId,
      name: formData.get("name"),
      nameEN: formData.get("nameEN") || "",
      description: formData.get("description"),
      descriptionEN: formData.get("descriptionEN") || "",
      price: formData.get("price"),
      subTitle: formData.get("subTitle"),
      subTitleEN: formData.get("subTitleEN") || "",
      slogan: formData.get("slogan"),
      sloganEN: formData.get("sloganEN") || "",
      categoryId: formData.get("categoryId"),
      scentIds: formData.get("scentIds")
        ? JSON.parse(formData.get("scentIds") as string)
        : undefined,
      arAnimation: formData.get("arAnimation"),
      messageType: formData.get("messageType"),
      imageUrl: formData.get("imageUrl") || "",
      images: formData.get("images")
        ? JSON.parse(formData.get("images") as string)
        : undefined,
    };

    const validatedFields = productUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const data = validatedFields.data;

    // Vérifications des relations si modifiées
    if (data.scentIds && data.scentIds.length > 0) {
      const existingScents = await prisma.scent.findMany({
        where: { id: { in: data.scentIds } },
      });

      if (existingScents.length !== data.scentIds.length) {
        return validationError(
          { scentIds: ["Un ou plusieurs parfums sont invalides"] },
          "Parfum(s) sélectionné(s) introuvable(s)"
        );
      }
    }

    if (data.categoryId) {
      const existingCategory = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!existingCategory) {
        return validationError(
          { categoryId: ["Catégorie invalide"] },
          "La catégorie sélectionnée n'existe pas"
        );
      }
    }

    // Gestion des images si fournies
    if (data.images && data.images.length > 0) {
      await prisma.image.deleteMany({ where: { productId } });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameEN !== undefined && { nameEN: data.nameEN || null }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.descriptionEN !== undefined && {
          descriptionEN: data.descriptionEN || null,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.subTitle !== undefined && { subTitle: data.subTitle }),
        ...(data.subTitleEN !== undefined && {
          subTitleEN: data.subTitleEN || null,
        }),
        ...(data.slogan !== undefined && { slogan: data.slogan }),
        ...(data.sloganEN !== undefined && { sloganEN: data.sloganEN || null }),
        ...(data.arAnimation !== undefined && {
          arAnimation: data.arAnimation,
        }),
        ...(data.hasEngraving !== undefined && {
          hasEngraving: data.hasEngraving,
        }),
        ...(data.engravingPrice !== undefined && {
          engravingPrice: data.engravingPrice ?? null,
        }),
        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),
        ...(data.scentIds && data.scentIds.length > 0 && {
          scents: { set: data.scentIds.map((id: string) => ({ id })) },
        }),
        ...(data.images &&
          data.images.length > 0 && {
            images: { create: data.images },
          }),
      },
      include: {
        scents: true,
        category: true,
        images: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/");

    return successResponse(product);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return errorResponse(
      "Une erreur est survenue lors de la mise à jour du produit"
    );
  }
}

/**
 * Mettre à jour un produit via JSON (pour React Query)
 */
export async function updateProductFromJSON(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse("Produit introuvable");
    }

    const payload =
      typeof data === "object" && data !== null
        ? { id, ...(data as Record<string, unknown>) }
        : { id };

    const validatedFields = productUpdateSchema.safeParse(payload);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const validData = validatedFields.data;

    // Vérifications des relations si modifiées
    if (validData.scentIds && validData.scentIds.length > 0) {
      const scents = await prisma.scent.findMany({
        where: { id: { in: validData.scentIds } },
      });
      if (scents.length !== validData.scentIds.length) {
        return errorResponse("Parfum(s) invalide(s)");
      }
    }

    if (validData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validData.categoryId },
      });
      if (!category) {
        return errorResponse("Catégorie invalide");
      }
    }

    // Gestion des images si fournies
    if (validData.images && validData.images.length > 0) {
      await prisma.image.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(validData.name !== undefined && { name: validData.name }),
        ...(validData.nameEN !== undefined && {
          nameEN: validData.nameEN || null,
        }),
        ...(validData.description !== undefined && {
          description: validData.description,
        }),
        ...(validData.descriptionEN !== undefined && {
          descriptionEN: validData.descriptionEN || null,
        }),
        ...(validData.price !== undefined && { price: validData.price }),
        ...(validData.subTitle !== undefined && {
          subTitle: validData.subTitle,
        }),
        ...(validData.subTitleEN !== undefined && {
          subTitleEN: validData.subTitleEN || null,
        }),
        ...(validData.slogan !== undefined && { slogan: validData.slogan }),
        ...(validData.sloganEN !== undefined && {
          sloganEN: validData.sloganEN || null,
        }),
        ...(validData.arAnimation !== undefined && {
          arAnimation: validData.arAnimation,
        }),
        ...(validData.hasEngraving !== undefined && {
          hasEngraving: validData.hasEngraving,
        }),
        ...(validData.engravingPrice !== undefined && {
          engravingPrice: validData.engravingPrice ?? null,
        }),
        ...(validData.categoryId && {
          category: { connect: { id: validData.categoryId } },
        }),
        ...(validData.scentIds && validData.scentIds.length > 0 && {
          scents: { set: validData.scentIds.map((id: string) => ({ id })) },
        }),
        ...(validData.images &&
          validData.images.length > 0 && {
            images: { create: validData.images },
          }),
      },
      include: {
        scents: true,
        category: true,
        images: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/");

    return successResponse(product);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return errorResponse(
      "Une erreur est survenue lors de la mise à jour du produit"
    );
  }
}
