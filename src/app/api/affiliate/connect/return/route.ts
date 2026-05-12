import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const affiliateId = req.nextUrl.searchParams.get("affiliateId");
  if (!affiliateId) return NextResponse.redirect(new URL("/profil/affiliation", req.url));

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    select: { stripeAccountId: true },
  });

  if (affiliate?.stripeAccountId) {
    const account = await stripe.accounts.retrieve(affiliate.stripeAccountId);
    if (account.details_submitted) {
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: { stripeOnboarded: true },
      });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return NextResponse.redirect(new URL("/profil/affiliation?connect=success", appUrl!));
}
