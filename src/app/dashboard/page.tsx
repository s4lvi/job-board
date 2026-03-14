import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;

  const [activeListings, pendingApps, activeContracts, totalEarned] = await Promise.all([
    prisma.listing.count({ where: { userId, status: "ACTIVE" } }),
    prisma.application.count({ where: { userId, status: "PENDING" } }),
    prisma.contract.count({
      where: { OR: [{ posterId: userId }, { seekerId: userId }], status: "ACTIVE" },
    }),
    prisma.contract.aggregate({
      where: { seekerId: userId, status: "COMPLETED" },
      _sum: { agreedAmount: true },
    }),
  ]);

  const recentListings = await prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { applications: true } } },
  });

  const recentApplications = await prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { listing: { select: { id: true, title: true, type: true } } },
  });

  const stats = [
    { label: "Active Listings", value: activeListings, color: "text-primary" },
    { label: "Pending Apps", value: pendingApps, color: "text-accent" },
    { label: "Active Contracts", value: activeContracts, color: "text-success" },
    { label: "Total Earned", value: formatCurrency(Number(totalEarned._sum.agreedAmount || 0)), color: "text-accent" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl">Overview</h1>
        <p className="text-white/40 text-sm mt-1">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-white/5 bg-surface p-5 card-cut">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm">My Listings</h2>
            <Link href="/dashboard/listings" className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {recentListings.length > 0 ? (
              recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="block border border-white/5 bg-surface p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{listing.title}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {listing._count.applications} apps · {formatRelativeTime(listing.createdAt)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      listing.status === "ACTIVE" ? "text-success" : "text-white/30"
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-white/30 text-sm border border-white/5 bg-surface">
                <p>No listings yet</p>
                <Link href="/listings/create" className="text-primary hover:underline text-xs mt-2 inline-block">
                  Create your first listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm">My Applications</h2>
            <Link href="/dashboard/applications" className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/listings/${app.listing.id}`}
                  className="block border border-white/5 bg-surface p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{app.listing.title}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {app.listing.type} · {formatRelativeTime(app.createdAt)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      app.status === "ACCEPTED" ? "text-success" :
                      app.status === "REJECTED" ? "text-danger" :
                      app.status === "PENDING" ? "text-accent" : "text-white/30"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-white/30 text-sm border border-white/5 bg-surface">
                <p>No applications yet</p>
                <Link href="/listings" className="text-primary hover:underline text-xs mt-2 inline-block">
                  Browse listings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
