import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {children}
    </div>
  );
}
