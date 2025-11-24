-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'TEMPERATURE';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "temperature" DOUBLE PRECISION;
