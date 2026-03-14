import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true, email: true },
  });

  let accountId = user?.stripeAccountId;

  // Create Stripe Connect account if doesn't exist
  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      email: user?.email || undefined,
      capabilities: {
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeAccountId: accountId },
    });
  }

  // Create account link for onboarding
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
