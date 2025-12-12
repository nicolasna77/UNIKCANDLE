import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { jsPDF } from "jspdf";

// Types pour la facture
interface InvoiceOrder {
  id: string;
  createdAt: Date;
  total: number;
  status: string;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  } | null;
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
    scent: {
      name: string;
    };
  }>;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId } = await context.params;

    // Récupérer la commande complète
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
          },
        },
        shippingAddress: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à accéder à cette facture" },
        { status: 403 }
      );
    }

    // Générer le PDF de la facture
    const pdfBuffer = generateInvoicePDF(order as InvoiceOrder);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération de la facture",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// Fonction pour générer le PDF de la facture avec jsPDF
function generateInvoicePDF(order: InvoiceOrder): Uint8Array {
  const doc = new jsPDF();

  // Configuration des couleurs
  const primaryColor = [51, 51, 51] as [number, number, number];
  const grayColor = [153, 153, 153] as [number, number, number];
  const lightGrayColor = [240, 240, 240] as [number, number, number];

  // En-tête de la facture
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text("UNIKCANDLE", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text("123 Rue des Bougies", 20, 28);
  doc.text("75001 Paris, France", 20, 33);
  doc.text("contact@unikcandle.com", 20, 38);
  doc.text("+33 1 23 45 67 89", 20, 43);

  // Informations de la facture (à droite)
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text("FACTURE", 150, 20);

  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`N°: ${order.id.slice(0, 8).toUpperCase()}`, 150, 28);
  doc.text(`Date: ${formattedDate}`, 150, 33);

  // Badge de statut
  const statusText =
    order.status === "DELIVERED"
      ? "Livré"
      : order.status === "PROCESSING"
        ? "En préparation"
        : order.status === "CANCELLED"
          ? "Annulé"
          : "En attente";
  doc.setFillColor(...lightGrayColor);
  doc.roundedRect(150, 37, 40, 7, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text(statusText, 152, 42);

  // Ligne de séparation
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 50, 190, 50);

  // Informations client et livraison
  let yPos = 60;
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text("FACTURÉ À", 20, yPos);
  doc.text("ADRESSE DE LIVRAISON", 110, yPos);

  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(order.user.name || "Client", 20, yPos);
  if (order.shippingAddress) {
    doc.text(order.shippingAddress.street, 110, yPos);
  }

  yPos += 5;
  doc.setFontSize(9);
  doc.text(order.user.email, 20, yPos);
  if (order.shippingAddress) {
    doc.text(
      `${order.shippingAddress.zipCode} ${order.shippingAddress.city}`,
      110,
      yPos
    );
  }

  if (order.shippingAddress) {
    yPos += 5;
    doc.text(order.shippingAddress.street, 20, yPos);
    doc.text(order.shippingAddress.country, 110, yPos + 5);

    yPos += 5;
    doc.text(
      `${order.shippingAddress.zipCode} ${order.shippingAddress.city}`,
      20,
      yPos
    );

    yPos += 5;
    doc.text(order.shippingAddress.country, 20, yPos);
  }

  // Tableau des articles
  yPos = 100;

  // En-tête du tableau
  doc.setFillColor(...lightGrayColor);
  doc.rect(20, yPos, 170, 8, "F");

  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text("PRODUIT", 22, yPos + 5);
  doc.text("QTÉ", 120, yPos + 5);
  doc.text("PRIX U.", 145, yPos + 5);
  doc.text("TOTAL", 175, yPos + 5);

  yPos += 12;

  // Lignes du tableau
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);

  let subtotal = 0;
  order.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Nom du produit
    doc.text(item.product.name, 22, yPos);

    // Parfum (en gris, plus petit)
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(`Parfum: ${item.scent.name}`, 22, yPos + 4);

    // Quantité, prix unitaire et total
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(item.quantity.toString(), 125, yPos, { align: "right" });
    doc.text(`${item.price.toFixed(2)}€`, 165, yPos, { align: "right" });
    doc.text(`${itemTotal.toFixed(2)}€`, 188, yPos, { align: "right" });

    yPos += 10;

    // Ligne de séparation
    doc.setDrawColor(...lightGrayColor);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    yPos += 4;
  });

  // Totaux
  yPos += 10;
  const shipping = 0;
  const tax = subtotal * 0.2; // TVA 20%

  doc.setFontSize(10);
  doc.setTextColor(...grayColor);

  // Sous-total
  doc.text("Sous-total", 140, yPos);
  doc.text(`${subtotal.toFixed(2)}€`, 188, yPos, { align: "right" });
  yPos += 6;

  // Livraison
  doc.text("Livraison", 140, yPos);
  doc.text(`${shipping.toFixed(2)}€`, 188, yPos, { align: "right" });
  yPos += 6;

  // TVA
  doc.text("TVA (20%)", 140, yPos);
  doc.text(`${tax.toFixed(2)}€`, 188, yPos, { align: "right" });
  yPos += 10;

  // Total (en gras et plus grand)
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(140, yPos - 2, 190, yPos - 2);
  doc.text("TOTAL", 140, yPos + 4);
  doc.text(`${order.total.toFixed(2)}€`, 188, yPos + 4, { align: "right" });

  // Pied de page
  yPos = 270;
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text("Merci pour votre commande chez UNIKCANDLE !", 105, yPos, {
    align: "center",
  });
  doc.text(
    "Pour toute question, contactez-nous à contact@unikcandle.com",
    105,
    yPos + 5,
    { align: "center" }
  );

  yPos += 15;
  doc.setFontSize(7);
  doc.text(
    "UNIKCANDLE - SIRET: 123 456 789 00010 - TVA: FR12345678900",
    105,
    yPos,
    { align: "center" }
  );
  doc.text("Capital social: 10 000€ - RCS Paris B 123 456 789", 105, yPos + 4, {
    align: "center",
  });

  // Retourner un Uint8Array compatible avec Response
  const pdfOutput = doc.output("arraybuffer");
  return new Uint8Array(pdfOutput as ArrayBuffer);
}
