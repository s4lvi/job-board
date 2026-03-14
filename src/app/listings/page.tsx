import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/listings/listing-card";
import ListingFilters from "@/components/listings/listing-filters";
import Pagination from "@/components/ui/pagination";
import type { ListingStatus, ListingType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const ITEMS_PER_PAGE = 12;

type SearchParams = Promise<{
  type?: string;
  category?: string;
  search?: string;
  remote?: string;
  sort?: string;
  page?: string;
}>;

async function getListings(params: Awaited<SearchParams>) {
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE" as ListingStatus,
  };

  if (params.type && ["JOB", "GIG", "BOUNTY"].includes(params.type)) {
    where.type = params.type as ListingType;
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { tags: { hasSome: [params.search.toLowerCase()] } },
    ];
  }

  if (params.remote === "true") {
    where.isRemote = true;
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    params.sort === "oldest" ? { createdAt: "asc" }
    : params.sort === "budget_high" ? { budgetFixed: "desc" }
    : params.sort === "budget_low" ? { budgetFixed: "asc" }
    : { createdAt: "desc" };

  const page = Math.max(1, Number(params.page) || 1);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true, title: true } },
        category: true,
        _count: { select: { applications: true } },
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, page, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  let data: Awaited<ReturnType<typeof getListings>>;
  try {
    data = await getListings(params);
  } catch {
    data = { listings: [], total: 0, page: 1, totalPages: 0 };
  }

  let categories: Awaited<ReturnType<typeof getCategories>>;
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
          Opportunities
        </span>
        <h1 className="text-3xl md:text-4xl mt-2">Browse Listings</h1>
        <p className="text-white/40 mt-2">
          {data.total} {data.total === 1 ? "listing" : "listings"} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <ListingFilters categories={categories} />
        </aside>

        {/* Listings Grid */}
        <div className="flex-1">
          {data.listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.listings.map((listing) => (
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

              {data.totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <PaginationWrapper currentPage={data.page} totalPages={data.totalPages} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-white/5 bg-surface card-cut">
              <p className="text-white/40 text-lg mb-2">No listings found</p>
              <p className="text-white/20 text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationWrapper({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  "use client";
  return <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={() => {}} />;
}
