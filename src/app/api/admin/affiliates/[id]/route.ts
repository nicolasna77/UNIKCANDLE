import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";
import { stripe } from "@/lib/stripe";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      clicks: { orderBy: { createdAt: "desc" }, take: 50 },
      commissions: {
        orderBy: { createdAt: "desc" },
        include: { order: { select: { id: true, total: true, createdAt: true } } },
      },
    },
  });

  if (!affiliate) return new NextResponse("Affilié introuvable", { status: 404 });
  return NextResponse.json(affiliate);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const { commissionRate, minPayoutAmount, status } = body;

  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: {
      ...(commissionRate !== undefined ? { commissionRate } : {}),
      ...(minPayoutAmount !== undefined ? { minPayoutAmount } : {}),
      ...(status !== undefined ? { status } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(affiliate);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const { id } = await params;
  await prisma.affiliate.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

// POST /api/admin/affiliates/[id]?action=approve-commission&commissionId=xxx
// POST /api/admin/affiliates/[id]?action=payout
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "approve-commission") {
    const body = await req.json();
    const { commissionId } = body;
    const commission = await prisma.affiliateCommission.update({
      where: { id: commissionId, affiliateId: id },
      data: { status: "APPROVED" },
    });
    return NextResponse.json(commission);
  }

  if (action === "reject-commission") {
    const body = await req.json();
    const { commissionId } = body;
    const commission = await prisma.affiliateCommission.update({
      where: { id: commissionId, affiliateId: id },
      data: { status: "REJECTED" },
    });
    // Déduire le montant du total gagné
    await prisma.affiliate.update({
      where: { id },
      data: { totalEarned: { decrement: commission.amount } },
    });
    return NextResponse.json(commission);
  }

  if (action === "payout") {
    const affiliate = await prisma.affiliate.findUnique({ where: { id } });
    if (!affiliate) return new NextResponse("Affilié introuvable", { status: 404 });

    if (!affiliate.stripeAccountId || !affiliate.stripeOnboarded) {
      return new NextResponse("L'affilié n'a pas encore connecté son compte Stripe", { status: 400 });
    }

    const approvedCommissions = await prisma.affiliateCommission.findMany({
      where: { affiliateId: id, status: "APPROVED" },
    });

    if (approvedCommissions.length === 0) {
      return new NextResponse("Aucune commission approuvée à payer", { status: 400 });
    }

    const totalAmount = approvedCommissions.reduce((sum, c) => sum + c.amount, 0);

    if (totalAmount < affiliate.minPayoutAmount) {
      return new NextResponse(
        `Le solde (${totalAmount.toFixed(2)}€) est inférieur au seuil minimum (${affiliate.minPayoutAmount}€)`,
        { status: 400 }
      );
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(totalAmount * 100),
      currency: "eur",
      destination: affiliate.stripeAccountId,
      description: `Commissions affilié ${affiliate.code}`,
    });

    await prisma.$transaction([
      prisma.affiliateCommission.updateMany({
        where: { affiliateId: id, status: "APPROVED" },
        data: { status: "PAID", paidAt: new Date(), stripeTransferId: transfer.id },
      }),
      prisma.affiliate.update({
        where: { id },
        data: { totalPaid: { increment: totalAmount } },
      }),
    ]);

    return NextResponse.json({ transferId: transfer.id, amount: totalAmount });
  }

  return new NextResponse("Action inconnue", { status: 400 });
}
