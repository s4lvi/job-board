import Link from "next/link";
import ListingCard from "@/components/listings/listing-card";
import { prisma } from "@/lib/prisma";

const categories = [
  { icon: "💻", name: "Development", desc: "Web, mobile, and software engineering" },
  { icon: "🎨", name: "Design", desc: "UI/UX, graphic design, and branding" },
  { icon: "📝", name: "Writing", desc: "Content, copywriting, and documentation" },
  { icon: "📊", name: "Marketing", desc: "SEO, social media, and advertising" },
  { icon: "🔧", name: "Operations", desc: "Admin, data entry, and management" },
  { icon: "📹", name: "Media", desc: "Video, photography, and production" },
];

async function getFeaturedListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { id: true, name: true, image: true, title: true } },
        category: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return listings;
  } catch (e) {
    console.error("getFeaturedListings error:", e);
    return [];
  }
}

async function getStats() {
  try {
    const [listings, users, contracts] = await Promise.all([
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.contract.count({ where: { status: "COMPLETED" } }),
    ]);
    return { listings, users, contracts };
  } catch (e) {
    console.error("getStats error:", e);
    return { listings: 0, users: 0, contracts: 0 };
  }
}

export default async function HomePage() {
  const [featuredListings, stats] = await Promise.all([
    getFeaturedListings(),
    getStats(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 stripe-bar opacity-[0.03]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[2px] w-8 bg-primary" />
              <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
                ACP Job Board
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-6">
              Find Work.
              <br />
              <span className="text-primary">Post Jobs.</span>
              <br />
              Get Paid.
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              The internal marketplace for ACP members. Post jobs, gigs, and bounties
              with secure escrow payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/listings" className="btn-primary btn-lg text-center">
                Browse Listings
              </Link>
              <Link href="/listings/create" className="btn-accent btn-lg text-center">
                Post an Opportunity
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[
              { value: stats.listings, label: "Active Listings" },
              { value: stats.users, label: "Members" },
              { value: stats.contracts, label: "Completed Contracts" },
            ].map((stat) => (
              <div key={stat.label} className="py-8 text-center">
                <div className="text-3xl md:text-4xl font-black text-primary">{stat.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex gap-[3px] max-w-7xl mx-auto">
        <div className="h-[3px] bg-primary flex-1" />
        <div className="h-[3px] bg-primary flex-1" />
        <div className="h-[3px] bg-primary flex-1" />
      </div>

      {/* Featured Listings */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
                Latest Opportunities
              </span>
              <h2 className="text-2xl md:text-3xl mt-2">Featured Listings</h2>
            </div>
            <Link href="/listings" className="btn-secondary btn-sm hidden sm:inline-block">
              View All
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  type={listing.type}
                  budgetFixed={listing.budgetFixed ? Number(listing.budgetFixed) : null}
                  budgetMin={listing.budgetMin ? Number(listing.budgetMin) : null}
                  budgetMax={listing.budgetMax ? Number(listing.budgetMax) : null}
                  hourlyRate={listing.hourlyRate ? Number(listing.hourlyRate) : null}
                  budgetKind={listing.budgetKind}
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
          ) : (
            <div className="text-center py-20 border border-white/5 bg-surface card-cut">
              <p className="text-white/40 text-lg mb-4">No listings yet</p>
              <Link href="/listings/create" className="btn-primary">
                Be the first to post
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/listings" className="btn-secondary">View All Listings</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
              Simple Process
            </span>
            <h2 className="text-2xl md:text-3xl mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Post or Browse",
                desc: "Create a job, gig, or bounty listing — or browse available opportunities that match your skills.",
              },
              {
                step: "02",
                title: "Apply & Connect",
                desc: "Submit applications with your bid. Posters review and accept the best fit for the job.",
              },
              {
                step: "03",
                title: "Work & Get Paid",
                desc: "Complete the work with secure escrow. Funds are released when the job is done.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border border-white/5 p-8 card-cut hover:border-primary/30 transition-colors"
              >
                <div className="text-4xl font-black text-primary/30 mb-4">{item.step}</div>
                <h3 className="text-sm mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
              Browse By
            </span>
            <h2 className="text-2xl md:text-3xl mt-2">Categories</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/listings?category=${cat.name.toLowerCase()}`}
                className="border border-white/5 p-6 text-center hover:border-primary/30 transition-all group card-cut"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h4 className="text-xs font-black uppercase tracking-wider group-hover:text-primary transition-colors">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 stripe-bar opacity-[0.04]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-2xl md:text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
            Join the ACP community and start posting or finding work today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary btn-lg text-center">
              Create Account
            </Link>
            <Link href="/listings" className="btn-secondary btn-lg text-center">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
