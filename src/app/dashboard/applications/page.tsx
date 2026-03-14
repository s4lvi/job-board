import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

const statusVariants = {
  PENDING: "accent",
  ACCEPTED: "success",
  REJECTED: "danger",
  WITHDRAWN: "default",
} as const;

export default async function MyApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        select: {
          id: true, title: true, type: true, status: true,
          budgetFixed: true, budgetMin: true, budgetMax: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl mb-8">My Applications</h1>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => {
            const budget = app.listing.budgetFixed
              ? formatCurrency(Number(app.listing.budgetFixed))
              : app.listing.budgetMin && app.listing.budgetMax
                ? `${formatCurrency(Number(app.listing.budgetMin))} - ${formatCurrency(Number(app.listing.budgetMax))}`
                : null;

            return (
              <Link
                key={app.id}
                href={`/listings/${app.listing.id}`}
                className="block border border-white/5 bg-surface p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusVariants[app.status]}>{app.status}</Badge>
                      <Badge variant={app.listing.type === "JOB" ? "primary" : app.listing.type === "GIG" ? "accent" : "success"}>
                        {app.listing.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold">{app.listing.title}</p>
                    <div className="flex gap-4 text-[10px] text-white/30 mt-1">
                      <span>by {app.listing.user.name}</span>
                      {budget && <span>{budget}</span>}
                      {app.bidAmount && <span>Your bid: {formatCurrency(Number(app.bidAmount))}</span>}
                      <span>{formatRelativeTime(app.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/5 bg-surface card-cut">
          <p className="text-white/40 text-lg mb-4">No applications yet</p>
          <Link href="/listings" className="btn-primary">Browse Listings</Link>
        </div>
      )}
    </div>
  );
}
