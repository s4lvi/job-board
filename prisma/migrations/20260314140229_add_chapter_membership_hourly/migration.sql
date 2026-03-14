-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "budgetKind" TEXT,
ADD COLUMN     "hourlyRate" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chapter" TEXT,
ADD COLUMN     "membershipLevel" TEXT;
