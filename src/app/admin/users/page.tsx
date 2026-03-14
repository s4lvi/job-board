import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";

type SearchParams = Promise<{ search?: string; role?: string; page?: string }>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.role && ["ADMIN", "POSTER", "SEEKER"].includes(params.role)) {
    where.role = params.role;
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: { select: { listings: true, applications: true, contractsAsPoster: true, contractsAsSeeker: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl mb-8">User Management</h1>

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="border border-white/5 bg-surface p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={user.image} name={user.name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{user.name || "Unnamed"}</span>
                  <Badge variant={user.role === "ADMIN" ? "primary" : user.role === "POSTER" ? "accent" : "default"}>
                    {user.role}
                  </Badge>
                </div>
                <p className="text-white/40 text-xs">{user.email}</p>
                <div className="flex gap-3 text-[10px] text-white/30 mt-1">
                  <span>{user._count.listings} listings</span>
                  <span>{user._count.applications} apps</span>
                  <span>{user._count.contractsAsPoster + user._count.contractsAsSeeker} contracts</span>
                </div>
              </div>
            </div>
            <Link href={`/admin/users/${user.id}`} className="btn-ghost btn-sm">
              Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
