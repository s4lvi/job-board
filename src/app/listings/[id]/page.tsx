import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import ApplyForm from "./apply-form";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true, name: true, image: true, title: true, bio: true, location: true, createdAt: true,
          _count: { select: { reviewsReceived: true, listings: true } },
        },
      },
      category: true,
      _count: { select: { applications: true } },
    },
  });
  return listing;
}

const typeVariants = { JOB: "primary", GIG: "accent", BOUNTY: "success" } as const;

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const session = await auth();
  const isOwner = session?.user?.id === listing.userId;

  const budget = listing.budgetFixed
    ? formatCurrency(Number(listing.budgetFixed))
    : listing.budgetMin && listing.budgetMax
      ? `${formatCurrency(Number(listing.budgetMin))} - ${formatCurrency(Number(listing.budgetMax))}`
      : listing.budgetMin
        ? `From ${formatCurrency(Number(listing.budgetMin))}`
        : null;

  let hasApplied = false;
  if (session?.user && !isOwner) {
    const app = await prisma.application.findUnique({
      where: { listingId_userId: { listingId: id, userId: session.user.id } },
    });
    hasApplied = !!app;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={typeVariants[listing.type]}>{listing.type}</Badge>
              {listing.category && <Badge variant="outline">{listing.category.name}</Badge>}
              <Badge variant={listing.status === "ACTIVE" ? "success" : "default"}>
                {listing.status}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl mb-4">{listing.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-white/50">
              {budget && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-accent font-bold">{budget}</span>
                </span>
              )}
              {(listing.location || listing.isRemote) && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {listing.isRemote ? "Remote" : listing.location}
                </span>
              )}
              {listing.deadline && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due {formatDate(listing.deadline)}
                </span>
              )}
              <span className="text-white/30">Posted {formatRelativeTime(listing.createdAt)}</span>
            </div>
          </div>

          {/* Tags */}
          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {listing.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-white/40 border border-white/10 px-3 py-1 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="flex gap-[3px] mb-8">
            <div className="h-[2px] bg-primary flex-1" />
            <div className="h-[2px] bg-primary flex-1" />
            <div className="h-[2px] bg-primary flex-1" />
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <div className="text-white/70 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-6 text-sm text-white/40">
            <span>{listing._count.applications} {listing._count.applications === 1 ? "application" : "applications"}</span>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-6">
          {/* Apply / Owner Actions */}
          {isOwner ? (
            <div className="border border-white/5 bg-surface p-6 card-cut">
              <h3 className="text-sm mb-4">Manage Listing</h3>
              <div className="space-y-3">
                <Link href={`/listings/${id}/edit`} className="btn-primary w-full text-center block">
                  Edit Listing
                </Link>
                <Link href={`/dashboard/listings`} className="btn-secondary w-full text-center block">
                  View Applications
                </Link>
              </div>
            </div>
          ) : session?.user ? (
            <div className="border border-white/5 bg-surface p-6 card-cut">
              {hasApplied ? (
                <div className="text-center">
                  <Badge variant="success">Applied</Badge>
                  <p className="text-white/40 text-sm mt-3">You&apos;ve already applied to this listing</p>
                </div>
              ) : (
                <ApplyForm listingId={id} listingType={listing.type} />
              )}
            </div>
          ) : (
            <div className="border border-white/5 bg-surface p-6 card-cut text-center">
              <p className="text-white/40 text-sm mb-4">Sign in to apply</p>
              <Link href="/auth/login" className="btn-primary w-full text-center block">
                Sign In
              </Link>
            </div>
          )}

          {/* Poster Card */}
          <div className="border border-white/5 bg-surface p-6 card-cut">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-4">
              Posted By
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={listing.user.image} name={listing.user.name} size="lg" />
              <div>
                <Link href={`/users/${listing.user.id}`} className="font-bold text-sm hover:text-primary transition-colors">
                  {listing.user.name}
                </Link>
                {listing.user.title && (
                  <p className="text-white/40 text-xs">{listing.user.title}</p>
                )}
              </div>
            </div>
            {listing.user.bio && (
              <p className="text-white/40 text-sm leading-relaxed mb-4">{listing.user.bio}</p>
            )}
            <div className="flex gap-4 text-xs text-white/30">
              <span>{listing.user._count.listings} listings</span>
              <span>{listing.user._count.reviewsReceived} reviews</span>
            </div>
          </div>

          {/* Budget Breakdown */}
          {budget && (
            <div className="border border-white/5 bg-surface p-6 card-cut">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-4">
                Budget
              </h4>
              <div className="text-2xl font-black text-accent">{budget}</div>
              <p className="text-white/30 text-xs mt-2">10% platform fee applies</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
