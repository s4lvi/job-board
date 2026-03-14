import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

const statusVariants = {
  ACTIVE: "success",
  COMPLETED: "primary",
  DISPUTED: "danger",
  CANCELLED: "default",
} as const;

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;

  const contracts = await prisma.contract.findMany({
    where: { OR: [{ posterId: userId }, { seekerId: userId }] },
    include: {
      listing: { select: { id: true, title: true, type: true } },
      poster: { select: { id: true, name: true, image: true } },
      seeker: { select: { id: true, name: true, image: true } },
      escrow: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl mb-8">Contracts</h1>

      {contracts.length > 0 ? (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const isPoster = contract.posterId === userId;
            const otherParty = isPoster ? contract.seeker : contract.poster;

            return (
              <Link
                key={contract.id}
                href={`/dashboard/contracts/${contract.id}`}
                className="block border border-white/5 bg-surface p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <Avatar src={otherParty.image} name={otherParty.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusVariants[contract.status]}>{contract.status}</Badge>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                          {isPoster ? "You hired" : "Hired by"} {otherParty.name}
                        </span>
                      </div>
                      <p className="text-sm font-bold">{contract.listing.title}</p>
                      <div className="flex gap-4 text-[10px] text-white/30 mt-1">
                        <span className="text-accent font-bold">{formatCurrency(Number(contract.agreedAmount))}</span>
                        {contract.escrow && <span>Escrow: {contract.escrow.status}</span>}
                        <span>{formatRelativeTime(contract.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/5 bg-surface card-cut">
          <p className="text-white/40 text-lg mb-4">No contracts yet</p>
          <p className="text-white/20 text-sm">Contracts are created when applications are accepted</p>
        </div>
      )}
    </div>
  );
}
