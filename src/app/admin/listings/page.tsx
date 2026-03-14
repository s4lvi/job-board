import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    include: {
      user: { select: { name: true, email: true } },
      category: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusVariants = {
    ACTIVE: "success", DRAFT: "default", PAUSED: "accent", CLOSED: "danger", COMPLETED: "primary",
  } as const;

  return (
    <div>
      <h1 className="text-2xl mb-8">Listing Management</h1>

      <div className="border border-white/5 bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Type</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Budget</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Posted By</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Apps</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const budget = listing.budgetFixed
                ? formatCurrency(Number(listing.budgetFixed))
                : listing.budgetMin && listing.budgetMax
                  ? `${formatCurrency(Number(listing.budgetMin))}-${formatCurrency(Number(listing.budgetMax))}`
                  : "—";
              return (
                <tr key={listing.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-bold max-w-[200px] truncate">{listing.title}</td>
                  <td className="px-4 py-3"><Badge variant={listing.type === "JOB" ? "primary" : listing.type === "GIG" ? "accent" : "success"}>{listing.type}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusVariants[listing.status]}>{listing.status}</Badge></td>
                  <td className="px-4 py-3 text-accent">{budget}</td>
                  <td className="px-4 py-3 text-white/50">{listing.user.name}</td>
                  <td className="px-4 py-3">{listing._count.applications}</td>
                  <td className="px-4 py-3 text-white/30">{formatRelativeTime(listing.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/listings/${listing.id}`} className="text-primary text-xs font-bold hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
