"use client";

import { useState } from "react";
import { sendMessage } from "@/lib/actions/message.actions";

export default function MessageInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    const formData = new FormData();
    formData.set("conversationId", conversationId);
    formData.set("content", content.trim());
    await sendMessage(formData);
    setContent("");
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-white/5">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="input-field flex-1"
      />
      <button
        type="submit"
        disabled={!content.trim() || sending}
        className="btn-primary btn-sm disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
