import type {
  User,
  Listing,
  Application,
  Contract,
  Escrow,
  Review,
  Category,
  Notification,
  Verification,
  ListingType,
  ListingStatus,
  ApplicationStatus,
  ContractStatus,
  EscrowStatus,
  UserRole,
} from "@/generated/prisma/client";

export type {
  User,
  Listing,
  Application,
  Contract,
  Escrow,
  Review,
  Category,
  Notification,
  Verification,
};

export {
  type ListingType,
  type ListingStatus,
  type ApplicationStatus,
  type ContractStatus,
  type EscrowStatus,
  type UserRole,
};

// Extended types with relations
export type ListingWithUser = Listing & {
  user: Pick<User, "id" | "name" | "image" | "title">;
  category: Category | null;
  _count?: { applications: number };
};

export type ListingWithDetails = Listing & {
  user: Pick<User, "id" | "name" | "image" | "title" | "bio" | "location"> & {
    _count: { reviewsReceived: number };
  };
  category: Category | null;
  applications: (Application & {
    user: Pick<User, "id" | "name" | "image" | "title">;
  })[];
  _count: { applications: number };
};

export type ApplicationWithListing = Application & {
  listing: Pick<Listing, "id" | "title" | "type" | "status" | "budgetFixed" | "budgetMin" | "budgetMax">;
};

export type ContractWithDetails = Contract & {
  listing: Pick<Listing, "id" | "title" | "type">;
  poster: Pick<User, "id" | "name" | "image">;
  seeker: Pick<User, "id" | "name" | "image">;
  escrow: Escrow | null;
};

export type UserProfile = Pick<
  User,
  "id" | "name" | "email" | "image" | "bio" | "title" | "location" | "role" | "createdAt"
> & {
  verifications: Verification[];
  _count: {
    listings: number;
    reviewsReceived: number;
    contractsAsPoster: number;
    contractsAsSeeker: number;
  };
};

// Filter types
export type ListingFilters = {
  type?: ListingType;
  category?: string;
  search?: string;
  location?: string;
  isRemote?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  sort?: "newest" | "oldest" | "budget_high" | "budget_low" | "deadline";
  page?: number;
  limit?: number;
};
