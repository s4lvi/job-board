import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import StarRating from "@/components/ui/star-rating";
import ListingCard from "@/components/listings/listing-card";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      verifications: true,
      _count: {
        select: {
          listings: true,
          reviewsReceived: true,
          contractsAsPoster: true,
          contractsAsSeeker: true,
        },
      },
    },
  });

  if (!user) notFound();

  const reviews = await prisma.review.findMany({
    where: { subjectId: id },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const listings = await prisma.listing.findMany({
    where: { userId: id, status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, image: true, title: true } },
      category: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const verifiedEmail = user.verifications.some((v) => v.type === "EMAIL" && v.verified);
  const verifiedOrg = user.verifications.some((v) => v.type === "ORGANIZATION" && v.verified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="border border-white/5 bg-surface p-8 card-cut mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar src={user.image} name={user.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl">{user.name}</h1>
              {verifiedEmail && <Badge variant="success">Verified</Badge>}
              {verifiedOrg && <Badge variant="primary">Organization</Badge>}
              <Badge variant="outline">{user.role}</Badge>
            </div>
            {user.title && <p className="text-white/50 text-sm">{user.title}</p>}
            {user.location && <p className="text-white/30 text-xs mt-1">{user.location}</p>}
            {user.bio && <p className="text-white/50 text-sm mt-3 leading-relaxed">{user.bio}</p>}

            <div className="flex items-center gap-6 mt-4 text-xs text-white/40">
              {avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(avgRating)} size="sm" />
                  <span>{avgRating.toFixed(1)} ({reviews.length})</span>
                </div>
              )}
              <span>{user._count.listings} listings</span>
              <span>{user._count.contractsAsPoster + user._count.contractsAsSeeker} contracts</span>
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      {listings.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg mb-6">Active Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                type={listing.type}
                budgetFixed={listing.budgetFixed ? Number(listing.budgetFixed) : null}
                budgetMin={listing.budgetMin ? Number(listing.budgetMin) : null}
                budgetMax={listing.budgetMax ? Number(listing.budgetMax) : null}
                location={listing.location}
                isRemote={listing.isRemote}
                deadline={listing.deadline?.toISOString() ?? null}
                tags={listing.tags}
                createdAt={listing.createdAt.toISOString()}
                user={listing.user}
                category={listing.category}
                _count={listing._count}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-lg mb-6">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-white/5 bg-surface p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={review.author.image} name={review.author.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{review.author.name}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-[10px] text-white/30 ml-auto">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="text-white/50 text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
