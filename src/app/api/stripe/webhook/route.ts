import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const contractId = paymentIntent.metadata.contractId;

      if (contractId) {
        await prisma.escrow.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: "FUNDED", fundedAt: new Date() },
        });
      }
      break;
    }

    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer;
      const contractId = transfer.metadata?.contractId;

      if (contractId) {
        await prisma.escrow.updateMany({
          where: { contractId },
          data: {
            status: "RELEASED",
            stripeTransferId: transfer.id,
            releasedAt: new Date(),
          },
        });

        await prisma.contract.update({
          where: { id: contractId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntent = dispute.payment_intent as string;

      const escrow = await prisma.escrow.findFirst({
        where: { stripePaymentIntentId: paymentIntent },
      });

      if (escrow) {
        await prisma.escrow.update({
          where: { id: escrow.id },
          data: { status: "DISPUTED" },
        });

        await prisma.contract.update({
          where: { id: escrow.contractId },
          data: { status: "DISPUTED" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
