import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import EscrowActions from "./escrow-actions";

type Props = { params: Promise<{ id: string }> };

const statusVariants = {
  ACTIVE: "success",
  COMPLETED: "primary",
  DISPUTED: "danger",
  CANCELLED: "default",
} as const;

const escrowVariants = {
  PENDING: "accent",
  FUNDED: "success",
  RELEASED: "primary",
  REFUNDED: "default",
  DISPUTED: "danger",
} as const;

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, type: true } },
      poster: { select: { id: true, name: true, image: true, stripeAccountId: true } },
      seeker: { select: { id: true, name: true, image: true, stripeAccountId: true } },
      escrow: true,
      reviews: { include: { author: { select: { name: true } } } },
    },
  });

  if (!contract) notFound();

  const userId = session.user.id;
  const isPoster = contract.posterId === userId;
  const isSeeker = contract.seekerId === userId;
  if (!isPoster && !isSeeker && session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/contracts" className="text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider">
            ← Back to Contracts
          </Link>
          <h1 className="text-2xl mt-2">Contract Details</h1>
        </div>
        <Badge variant={statusVariants[contract.status]}>{contract.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing */}
          <div className="border border-white/5 bg-surface p-6 card-cut">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-3">Listing</h3>
            <Link href={`/listings/${contract.listing.id}`} className="text-lg font-bold hover:text-primary transition-colors">
              {contract.listing.title}
            </Link>
            <Badge variant={contract.listing.type === "JOB" ? "primary" : contract.listing.type === "GIG" ? "accent" : "success"} className="ml-2">
              {contract.listing.type}
            </Badge>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/5 bg-surface p-5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Poster</h4>
              <div className="flex items-center gap-3">
                <Avatar src={contract.poster.image} name={contract.poster.name} size="md" />
                <Link href={`/users/${contract.poster.id}`} className="text-sm font-bold hover:text-primary transition-colors">
                  {contract.poster.name}
                </Link>
              </div>
            </div>
            <div className="border border-white/5 bg-surface p-5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Worker</h4>
              <div className="flex items-center gap-3">
                <Avatar src={contract.seeker.image} name={contract.seeker.name} size="md" />
                <Link href={`/users/${contract.seeker.id}`} className="text-sm font-bold hover:text-primary transition-colors">
                  {contract.seeker.name}
                </Link>
              </div>
            </div>
          </div>

          {/* Escrow Actions */}
          <EscrowActions
            contractId={contract.id}
            isPoster={isPoster}
            contractStatus={contract.status}
            escrowStatus={contract.escrow?.status || null}
            seekerHasStripe={!!contract.seeker.stripeAccountId}
          />

          {/* Reviews */}
          {contract.reviews.length > 0 && (
            <div className="border border-white/5 bg-surface p-6">
              <h3 className="text-sm mb-4">Reviews</h3>
              {contract.reviews.map((review) => (
                <div key={review.id} className="mb-3">
                  <p className="text-sm font-bold">{review.author.name}</p>
                  <p className="text-accent text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  {review.comment && <p className="text-white/50 text-sm mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border border-white/5 bg-surface p-6 card-cut">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-4">Payment</h3>
            <div className="text-3xl font-black text-accent mb-2">
              {formatCurrency(Number(contract.agreedAmount))}
            </div>
            <p className="text-white/30 text-xs">
              Platform fee: {formatCurrency(Number(contract.platformFee))}
            </p>
            <p className="text-white/30 text-xs">
              Worker receives: {formatCurrency(Number(contract.agreedAmount) - Number(contract.platformFee))}
            </p>
          </div>

          {contract.escrow && (
            <div className="border border-white/5 bg-surface p-6 card-cut">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-4">Escrow</h3>
              <Badge variant={escrowVariants[contract.escrow.status]}>{contract.escrow.status}</Badge>
              <div className="mt-4 space-y-2 text-xs text-white/40">
                {contract.escrow.fundedAt && <p>Funded: {formatDate(contract.escrow.fundedAt)}</p>}
                {contract.escrow.releasedAt && <p>Released: {formatDate(contract.escrow.releasedAt)}</p>}
              </div>
            </div>
          )}

          {contract.deadline && (
            <div className="border border-white/5 bg-surface p-6 card-cut">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-2">Deadline</h3>
              <p className="text-sm font-bold">{formatDate(contract.deadline)}</p>
            </div>
          )}

          <div className="border border-white/5 bg-surface p-6 card-cut">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-2">Created</h3>
            <p className="text-sm">{formatDate(contract.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
