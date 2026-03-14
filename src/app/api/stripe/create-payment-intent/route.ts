import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractId } = await req.json();

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      seeker: { select: { stripeAccountId: true } },
      escrow: true,
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.posterId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (contract.escrow?.status === "FUNDED") {
    return NextResponse.json({ error: "Escrow already funded" }, { status: 400 });
  }

  if (!contract.seeker.stripeAccountId) {
    return NextResponse.json({ error: "Seeker has not connected Stripe" }, { status: 400 });
  }

  const amount = Number(contract.agreedAmount);
  const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100);
  const amountInCents = Math.round(amount * 100);

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    application_fee_amount: platformFee,
    transfer_data: {
      destination: contract.seeker.stripeAccountId,
    },
    metadata: {
      contractId: contract.id,
    },
  });

  // Create or update escrow record
  if (contract.escrow) {
    await prisma.escrow.update({
      where: { id: contract.escrow.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
  } else {
    await prisma.escrow.create({
      data: {
        contractId: contract.id,
        amount: amount,
        stripePaymentIntentId: paymentIntent.id,
        status: "PENDING",
      },
    });
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
