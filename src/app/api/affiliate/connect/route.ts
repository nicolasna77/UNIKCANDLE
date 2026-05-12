import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-session";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await getUser();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.id },
  });

  if (!affiliate) return new NextResponse("Vous n'êtes pas affilié", { status: 403 });

  let accountId = affiliate.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: session.email,
      capabilities: { transfers: { requested: true } },
    });
    accountId = account.id;
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { stripeAccountId: accountId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/profil/affiliation?connect=refresh`,
    return_url: `${appUrl}/api/affiliate/connect/return?affiliateId=${affiliate.id}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
