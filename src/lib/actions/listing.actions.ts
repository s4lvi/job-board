"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["JOB", "GIG", "BOUNTY"]),
  budgetType: z.enum(["fixed", "range"]),
  budgetFixed: z.coerce.number().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  deadline: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
});

export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    budgetType: formData.get("budgetType"),
    budgetFixed: formData.get("budgetFixed") || undefined,
    budgetMin: formData.get("budgetMin") || undefined,
    budgetMax: formData.get("budgetMax") || undefined,
    location: formData.get("location") || undefined,
    isRemote: formData.get("isRemote") === "true",
    deadline: formData.get("deadline") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    tags: formData.get("tags") || undefined,
  };

  const result = createListingSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;
  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      status: "ACTIVE",
      budgetFixed: data.budgetType === "fixed" ? data.budgetFixed : null,
      budgetMin: data.budgetType === "range" ? data.budgetMin : null,
      budgetMax: data.budgetType === "range" ? data.budgetMax : null,
      location: data.location || null,
      isRemote: data.isRemote || false,
      deadline: data.deadline ? new Date(data.deadline) : null,
      categoryId: data.categoryId || null,
      tags,
      userId: session.user.id,
    },
  });

  revalidatePath("/listings");
  return { success: true, listingId: listing.id };
}

export async function updateListing(listingId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found" };
  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const data = createListingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    budgetType: formData.get("budgetType"),
    budgetFixed: formData.get("budgetFixed") || undefined,
    budgetMin: formData.get("budgetMin") || undefined,
    budgetMax: formData.get("budgetMax") || undefined,
    location: formData.get("location") || undefined,
    isRemote: formData.get("isRemote") === "true",
    deadline: formData.get("deadline") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!data.success) return { error: data.error.issues[0].message };

  const tags = data.data.tags ? data.data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: data.data.title,
      description: data.data.description,
      type: data.data.type,
      budgetFixed: data.data.budgetType === "fixed" ? data.data.budgetFixed : null,
      budgetMin: data.data.budgetType === "range" ? data.data.budgetMin : null,
      budgetMax: data.data.budgetType === "range" ? data.data.budgetMax : null,
      location: data.data.location || null,
      isRemote: data.data.isRemote || false,
      deadline: data.data.deadline ? new Date(data.data.deadline) : null,
      categoryId: data.data.categoryId || null,
      tags,
    },
  });

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/listings");
  return { success: true };
}

export async function deleteListing(listingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found" };
  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/listings");
  return { success: true };
}

export async function toggleListingStatus(listingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found" };
  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const newStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: newStatus },
  });

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/listings");
  return { success: true, status: newStatus };
}
