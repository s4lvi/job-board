import Link from "next/link";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

type ListingCardProps = {
  id: string;
  title: string;
  type: "JOB" | "GIG" | "BOUNTY";
  budgetFixed?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
  isRemote: boolean;
  deadline?: string | null;
  tags: string[];
  createdAt: string;
  user: {
    name?: string | null;
    image?: string | null;
    title?: string | null;
  };
  category?: { name: string } | null;
  _count?: { applications: number };
};

const typeVariants = {
  JOB: "primary",
  GIG: "accent",
  BOUNTY: "success",
} as const;

export default function ListingCard({ id, title, type, budgetFixed, budgetMin, budgetMax, location, isRemote, deadline, tags, createdAt, user, category, _count }: ListingCardProps) {
  const budget = budgetFixed
    ? formatCurrency(budgetFixed)
    : budgetMin && budgetMax
      ? `${formatCurrency(budgetMin)} - ${formatCurrency(budgetMax)}`
      : budgetMin
        ? `From ${formatCurrency(budgetMin)}`
        : null;

  return (
    <Link href={`/listings/${id}`} className="group block">
      <div className="border border-white/5 hover:border-primary/40 bg-surface p-6 transition-all duration-300 card-cut">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant={typeVariants[type]}>{type}</Badge>
            {category && <Badge variant="outline">{category.name}</Badge>}
          </div>
          <span className="text-white/30 text-xs">{formatRelativeTime(createdAt)}</span>
        </div>

        <h3 className="text-base font-black uppercase tracking-wider mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        <div className="flex flex-wrap gap-3 mb-4 text-xs text-white/50">
          {budget && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-accent font-bold">{budget}</span>
            </span>
          )}
          {(location || isRemote) && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isRemote ? "Remote" : location}
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due {new Date(deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-white/30 border border-white/10 px-2 py-0.5 uppercase tracking-wider">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-white/30 px-1">+{tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Avatar src={user.image} name={user.name} size="sm" />
            <div>
              <p className="text-xs font-bold text-white/80">{user.name}</p>
              {user.title && <p className="text-[10px] text-white/30">{user.title}</p>}
            </div>
          </div>
          {_count && (
            <span className="text-[10px] text-white/30 uppercase tracking-wider">
              {_count.applications} {_count.applications === 1 ? "applicant" : "applicants"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
