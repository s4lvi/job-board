import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;

  const [earnedContracts, spentContracts] = await Promise.all([
    prisma.contract.findMany({
      where: { seekerId: userId, status: "COMPLETED" },
      include: { listing: { select: { title: true } }, escrow: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.contract.findMany({
      where: { posterId: userId },
      include: { listing: { select: { title: true } }, escrow: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalEarned = earnedContracts.reduce((sum, c) => sum + Number(c.agreedAmount) - Number(c.platformFee), 0);
  const totalSpent = spentContracts
    .filter((c) => c.status === "COMPLETED")
    .reduce((sum, c) => sum + Number(c.agreedAmount), 0);
  const pendingEscrow = spentContracts
    .filter((c) => c.escrow?.status === "FUNDED")
    .reduce((sum, c) => sum + Number(c.agreedAmount), 0);

  return (
    <div>
      <h1 className="text-2xl mb-8">Earnings & Payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="border border-white/5 bg-surface p-5 card-cut">
          <div className="text-2xl font-black text-success">{formatCurrency(totalEarned)}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">Total Earned</div>
        </div>
        <div className="border border-white/5 bg-surface p-5 card-cut">
          <div className="text-2xl font-black text-primary">{formatCurrency(totalSpent)}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">Total Spent</div>
        </div>
        <div className="border border-white/5 bg-surface p-5 card-cut">
          <div className="text-2xl font-black text-accent">{formatCurrency(pendingEscrow)}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">In Escrow</div>
        </div>
      </div>

      <h2 className="text-sm mb-4">Payment History</h2>

      {earnedContracts.length > 0 || spentContracts.length > 0 ? (
        <div className="space-y-2">
          {[...earnedContracts.map((c) => ({ ...c, direction: "earned" as const })),
            ...spentContracts.filter((c) => c.status === "COMPLETED").map((c) => ({ ...c, direction: "spent" as const }))
          ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((item) => (
              <div key={item.id} className="border border-white/5 bg-surface p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{item.listing.title}</p>
                  <p className="text-[10px] text-white/30 mt-1">
                    {item.completedAt ? formatDate(item.completedAt) : formatDate(item.createdAt)}
                  </p>
                </div>
                <span className={`font-black text-sm ${item.direction === "earned" ? "text-success" : "text-primary"}`}>
                  {item.direction === "earned" ? "+" : "-"}{formatCurrency(Number(item.agreedAmount))}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/30 text-sm border border-white/5 bg-surface">
          No payment history yet
        </div>
      )}
    </div>
  );
}
