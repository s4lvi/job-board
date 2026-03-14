"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const listingId = formData.get("listingId") as string;
  const coverLetter = formData.get("coverLetter") as string;
  const bidAmount = formData.get("bidAmount") ? Number(formData.get("bidAmount")) : null;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found" };
  if (listing.userId === session.user.id) return { error: "Cannot apply to your own listing" };
  if (listing.status !== "ACTIVE") return { error: "Listing is not accepting applications" };

  const existing = await prisma.application.findUnique({
    where: { listingId_userId: { listingId, userId: session.user.id } },
  });
  if (existing) return { error: "You have already applied" };

  await prisma.application.create({
    data: {
      listingId,
      userId: session.user.id,
      coverLetter: coverLetter || null,
      bidAmount: bidAmount,
    },
  });

  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function withdrawApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application) return { error: "Application not found" };
  if (application.userId !== session.user.id) return { error: "Not authorized" };
  if (application.status !== "PENDING") return { error: "Cannot withdraw a non-pending application" };

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });

  revalidatePath(`/listings/${application.listingId}`);
  revalidatePath("/dashboard/applications");
  return { success: true };
}

export async function acceptApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { listing: true },
  });
  if (!application) return { error: "Application not found" };
  if (application.listing.userId !== session.user.id) return { error: "Not authorized" };
  if (application.status !== "PENDING") return { error: "Application is not pending" };

  const agreedAmount = application.bidAmount
    ? Number(application.bidAmount)
    : application.listing.budgetFixed
      ? Number(application.listing.budgetFixed)
      : 0;

  const platformFee = Math.round(agreedAmount * 0.1 * 100) / 100;

  await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.contract.create({
      data: {
        listingId: application.listingId,
        posterId: session.user.id,
        seekerId: application.userId,
        applicationId: applicationId,
        agreedAmount: agreedAmount,
        platformFee: platformFee,
        deadline: application.listing.deadline,
      },
    }),
  ]);

  revalidatePath(`/listings/${application.listingId}`);
  revalidatePath("/dashboard/contracts");
  return { success: true };
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { listing: true },
  });
  if (!application) return { error: "Application not found" };
  if (application.listing.userId !== session.user.id) return { error: "Not authorized" };

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/listings/${application.listingId}`);
  return { success: true };
}
