import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/badge";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true, createdAt: true },
  });

  if (!user) redirect("/auth/login");

  return (
    <div>
      <h2 className="text-lg mb-6">Account</h2>

      <div className="space-y-6">
        <div className="border border-white/5 bg-surface p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Email</h3>
          <p className="text-sm">{user.email}</p>
        </div>

        <div className="border border-white/5 bg-surface p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Role</h3>
          <Badge variant={user.role === "ADMIN" ? "primary" : user.role === "POSTER" ? "accent" : "default"}>
            {user.role}
          </Badge>
        </div>

        <div className="border border-white/5 bg-surface p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Member Since</h3>
          <p className="text-sm">{user.createdAt.toLocaleDateString()}</p>
        </div>

        <div className="border border-danger/20 bg-danger/5 p-5">
          <h3 className="text-sm font-bold text-danger mb-2">Danger Zone</h3>
          <p className="text-white/40 text-xs mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button className="btn-danger btn-sm" disabled>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
