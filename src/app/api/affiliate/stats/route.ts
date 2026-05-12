import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-session";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getUser();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.id },
    include: {
      commissions: {
        orderBy: { createdAt: "desc" },
        include: { order: { select: { id: true, total: true, createdAt: true } } },
      },
      _count: { select: { clicks: true, commissions: true } },
    },
  });

  if (!affiliate) return new NextResponse("Vous n'êtes pas affilié", { status: 403 });

  const pendingAmount = affiliate.commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);

  const approvedAmount = affiliate.commissions
    .filter((c) => c.status === "APPROVED")
    .reduce((sum, c) => sum + c.amount, 0);

  const conversions = affiliate.commissions.length;
  const conversionRate =
    affiliate._count.clicks > 0
      ? ((conversions / affiliate._count.clicks) * 100).toFixed(1)
      : "0";

  // Gains par mois (6 derniers mois)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentCommissions = affiliate.commissions.filter(
    (c) => new Date(c.createdAt) >= sixMonthsAgo
  );
  const monthlyData: Record<string, number> = {};
  for (const c of recentCommissions) {
    const key = new Date(c.createdAt).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
    monthlyData[key] = (monthlyData[key] ?? 0) + c.amount;
  }

  return NextResponse.json({
    affiliate: {
      id: affiliate.id,
      code: affiliate.code,
      commissionRate: affiliate.commissionRate,
      minPayoutAmount: affiliate.minPayoutAmount,
      status: affiliate.status,
      stripeOnboarded: affiliate.stripeOnboarded,
      totalEarned: affiliate.totalEarned,
      totalPaid: affiliate.totalPaid,
    },
    stats: {
      clicks: affiliate._count.clicks,
      conversions,
      conversionRate,
      pendingAmount,
      approvedAmount,
      availableBalance: approvedAmount,
    },
    commissions: affiliate.commissions,
    monthlyData: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })),
  });
}
