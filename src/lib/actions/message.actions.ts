"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const conversationId = formData.get("conversationId") as string;
  const content = formData.get("content") as string;

  if (!content?.trim()) return { error: "Message cannot be empty" };

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId: session.user.id, conversationId } },
  });
  if (!participant) return { error: "Not a participant" };

  await prisma.message.create({
    data: {
      content: content.trim(),
      senderId: session.user.id,
      conversationId,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/messages/${conversationId}`);
  return { success: true };
}

export async function createConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };
  if (session.user.id === otherUserId) return { error: "Cannot message yourself" };

  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
  });

  if (existing) return { conversationId: existing.id };

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: session.user.id },
          { userId: otherUserId },
        ],
      },
    },
  });

  revalidatePath("/messages");
  return { conversationId: conversation.id };
}
