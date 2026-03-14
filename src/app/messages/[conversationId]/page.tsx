import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Avatar from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import MessageInput from "./message-input";

type Props = { params: Promise<{ conversationId: string }> };

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId: session.user.id, conversationId } },
  });

  if (!participant) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      messages: {
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const otherUser = conversation.participants.find((p) => p.userId !== session.user.id)?.user;

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <Avatar src={otherUser?.image} name={otherUser?.name} size="md" />
        <div>
          <h2 className="font-bold text-sm">{otherUser?.name || "Unknown"}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {conversation.messages.map((msg) => {
          const isMe = msg.senderId === session.user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isMe ? "order-2" : ""}`}>
                <div className={`px-4 py-3 text-sm ${
                  isMe
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-surface border border-white/5"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-white/20 mt-1 block">
                  {formatRelativeTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
