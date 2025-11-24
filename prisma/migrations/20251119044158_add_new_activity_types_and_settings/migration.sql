-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'BATH';
ALTER TYPE "ActivityType" ADD VALUE 'PLAY';
ALTER TYPE "ActivityType" ADD VALUE 'MEDICINE';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "bathTemp" INTEGER,
ADD COLUMN     "bathType" TEXT,
ADD COLUMN     "medicineAmount" TEXT,
ADD COLUMN     "medicineName" TEXT,
ADD COLUMN     "medicineUnit" TEXT,
ADD COLUMN     "playDuration" INTEGER,
ADD COLUMN     "playType" TEXT;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'ml',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationTimes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
