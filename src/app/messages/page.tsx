import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const conversations = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return (
    <div>
      <h1 className="text-2xl md:text-3xl mb-8">Messages</h1>

      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((cp) => {
            const otherParticipant = cp.conversation.participants.find(
              (p) => p.userId !== session.user.id
            );
            const lastMessage = cp.conversation.messages[0];
            const isUnread = lastMessage && (!cp.lastReadAt || new Date(lastMessage.createdAt) > new Date(cp.lastReadAt));

            return (
              <Link
                key={cp.conversationId}
                href={`/messages/${cp.conversationId}`}
                className="block border border-white/5 bg-surface p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={otherParticipant?.user.image}
                    name={otherParticipant?.user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        {otherParticipant?.user.name || "Unknown"}
                      </span>
                      {lastMessage && (
                        <span className="text-[10px] text-white/30">
                          {formatRelativeTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-white/70 font-bold" : "text-white/30"}`}>
                        {lastMessage.senderId === session.user.id && "You: "}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/5 bg-surface card-cut">
          <p className="text-white/40 text-lg mb-2">No messages yet</p>
          <p className="text-white/20 text-sm">Messages will appear here when you start a conversation</p>
        </div>
      )}
    </div>
  );
}
