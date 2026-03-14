import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

const statusVariants = {
  ACTIVE: "success",
  DRAFT: "default",
  PAUSED: "accent",
  CLOSED: "danger",
  COMPLETED: "primary",
} as const;

export default async function MyListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const listings = await prisma.listing.findMany({
    where: { userId: session.user.id },
    include: {
      category: true,
      _count: { select: { applications: true, contracts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">My Listings</h1>
        <Link href="/listings/create" className="btn-primary btn-sm">
          New Listing
        </Link>
      </div>

      {listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => {
            const budget = listing.budgetFixed
              ? formatCurrency(Number(listing.budgetFixed))
              : listing.budgetMin && listing.budgetMax
                ? `${formatCurrency(Number(listing.budgetMin))} - ${formatCurrency(Number(listing.budgetMax))}`
                : null;

            return (
              <div
                key={listing.id}
                className="border border-white/5 bg-surface p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusVariants[listing.status]}>{listing.status}</Badge>
                      <Badge variant={listing.type === "JOB" ? "primary" : listing.type === "GIG" ? "accent" : "success"}>
                        {listing.type}
                      </Badge>
                    </div>
                    <Link href={`/listings/${listing.id}`} className="text-sm font-bold hover:text-primary transition-colors">
                      {listing.title}
                    </Link>
                    <div className="flex gap-4 text-[10px] text-white/30 mt-1">
                      {budget && <span>{budget}</span>}
                      <span>{listing._count.applications} applications</span>
                      <span>{listing._count.contracts} contracts</span>
                      <span>{formatRelativeTime(listing.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/listings/${listing.id}`} className="btn-ghost btn-sm">
                      View
                    </Link>
                    <Link href={`/listings/${listing.id}/edit`} className="btn-secondary btn-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/5 bg-surface card-cut">
          <p className="text-white/40 text-lg mb-4">You haven&apos;t posted any listings yet</p>
          <Link href="/listings/create" className="btn-primary">Post Your First Listing</Link>
        </div>
      )}
    </div>
  );
}
