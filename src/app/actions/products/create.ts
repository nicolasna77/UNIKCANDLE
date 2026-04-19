"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/admin-schemas";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Créer un nouveau produit via FormData
 */
export async function createProduct(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const rawData = {
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
        : [],
      arAnimation: formData.get("arAnimation") || "default",
      messageType: formData.get("messageType") || "audio",
      hasEngraving: formData.get("hasEngraving") === "true",
      engravingPrice: formData.get("engravingPrice") ? Number(formData.get("engravingPrice")) : undefined,
      imageUrl: formData.get("imageUrl") || "",
      images: formData.get("images")
        ? JSON.parse(formData.get("images") as string)
        : undefined,
    };

    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const data = validatedFields.data;

    // Vérification des relations en parallèle
    const [existingScents, existingCategory] = await Promise.all([
      prisma.scent.findMany({ where: { id: { in: data.scentIds } } }),
      prisma.category.findUnique({ where: { id: data.categoryId } }),
    ]);

    if (existingScents.length !== data.scentIds.length) {
      return validationError(
        { scentIds: ["Un ou plusieurs parfums sont invalides"] },
        "Parfum(s) sélectionné(s) introuvable(s)"
      );
    }

    if (!existingCategory) {
      return validationError(
        { categoryId: ["Catégorie invalide"] },
        "La catégorie sélectionnée n'existe pas"
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        nameEN: data.nameEN || undefined,
        description: data.description,
        descriptionEN: data.descriptionEN || undefined,
        price: data.price,
        subTitle: data.subTitle,
        subTitleEN: data.subTitleEN || undefined,
        slogan: data.slogan,
        sloganEN: data.sloganEN || undefined,
        arAnimation: data.arAnimation || "default",
        hasEngraving: data.hasEngraving ?? false,
        engravingPrice: data.engravingPrice ?? null,
        category: { connect: { id: data.categoryId } },
        scents: { connect: data.scentIds.map((id: string) => ({ id })) },
        images: data.images?.length
          ? { create: data.images }
          : data.imageUrl
            ? { create: { url: data.imageUrl } }
            : undefined,
      },
      include: {
        scents: true,
        category: true,
        images: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(product);
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return errorResponse(
      "Une erreur est survenue lors de la création du produit"
    );
  }
}

/**
 * Créer un nouveau produit via JSON (pour React Query)
 */
export async function createProductFromJSON(
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const validatedFields = productSchema.safeParse(data);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const validData = validatedFields.data;

    const [existingScents, existingCategory] = await Promise.all([
      prisma.scent.findMany({ where: { id: { in: validData.scentIds } } }),
      prisma.category.findUnique({ where: { id: validData.categoryId } }),
    ]);

    if (existingScents.length !== validData.scentIds.length) {
      return validationError(
        { scentIds: ["Un ou plusieurs parfums sont invalides"] },
        "Parfum(s) sélectionné(s) introuvable(s)"
      );
    }

    if (!existingCategory) {
      return validationError(
        { categoryId: ["Catégorie invalide"] },
        "La catégorie sélectionnée n'existe pas"
      );
    }

    const product = await prisma.product.create({
      data: {
        name: validData.name,
        nameEN: validData.nameEN || undefined,
        description: validData.description,
        descriptionEN: validData.descriptionEN || undefined,
        price: validData.price,
        subTitle: validData.subTitle,
        subTitleEN: validData.subTitleEN || undefined,
        slogan: validData.slogan,
        sloganEN: validData.sloganEN || undefined,
        arAnimation: validData.arAnimation || "default",
        hasEngraving: validData.hasEngraving ?? false,
        engravingPrice: validData.engravingPrice ?? null,
        category: { connect: { id: validData.categoryId } },
        scents: { connect: validData.scentIds.map((id: string) => ({ id })) },
        images: validData.images?.length
          ? { create: validData.images }
          : validData.imageUrl
            ? { create: { url: validData.imageUrl } }
            : undefined,
      },
      include: {
        scents: true,
        category: true,
        images: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(product);
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return errorResponse(
      "Une erreur est survenue lors de la création du produit"
    );
  }
}
