import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";

export async function GET(req: Request) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const skip = (page - 1) * limit;

  const where = {
    ...(status !== "all" ? { status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED" } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [affiliates, total, totalEarned, totalPaid, pendingCount] = await Promise.all([
    prisma.affiliate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { clicks: true, commissions: true } },
      },
    }),
    prisma.affiliate.count({ where }),
    prisma.affiliate.aggregate({ _sum: { totalEarned: true } }),
    prisma.affiliate.aggregate({ _sum: { totalPaid: true } }),
    prisma.affiliateCommission.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    affiliates,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      totalAffiliates: total,
      totalEarned: totalEarned._sum.totalEarned ?? 0,
      totalPaid: totalPaid._sum.totalPaid ?? 0,
      pendingCommissions: pendingCount,
    },
  });
}

export async function POST(req: Request) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const body = await req.json();
  const { userId, code, commissionRate, minPayoutAmount } = body;

  if (!userId || !code) {
    return new NextResponse("userId et code requis", { status: 400 });
  }

  const normalizedCode = (code as string).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalizedCode.length < 4 || normalizedCode.length > 20) {
    return new NextResponse("Le code doit faire entre 4 et 20 caractères alphanumériques", { status: 400 });
  }

  const existing = await prisma.affiliate.findUnique({ where: { code: normalizedCode } });
  if (existing) return new NextResponse("Ce code est déjà utilisé", { status: 409 });

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) return new NextResponse("Utilisateur introuvable", { status: 404 });

  const affiliate = await prisma.affiliate.create({
    data: {
      userId,
      code: normalizedCode,
      commissionRate: commissionRate ?? 10,
      minPayoutAmount: minPayoutAmount ?? 20,
      status: "ACTIVE",
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(affiliate, { status: 201 });
}
