import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
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
      escrow: true,
      seeker: { select: { stripeAccountId: true } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.posterId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (!contract.escrow || contract.escrow.status !== "FUNDED") {
    return NextResponse.json({ error: "Escrow is not funded" }, { status: 400 });
  }

  // The payment was already transferred via Stripe Connect's transfer_data
  // Mark escrow as released and contract as completed
  await prisma.$transaction([
    prisma.escrow.update({
      where: { id: contract.escrow.id },
      data: { status: "RELEASED", releasedAt: new Date() },
    }),
    prisma.contract.update({
      where: { id: contractId },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
