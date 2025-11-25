-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('MEMO', 'TODO', 'VACCINATION', 'HEALTH_CHECKUP', 'MILESTONE', 'WONDER_WEEK', 'SLEEP_REGRESSION', 'FEEDING_STAGE', 'APPOINTMENT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NoteType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "priority" "Priority",
    "tags" TEXT[],
    "metadata" JSONB,
    "reminderDays" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_babyId_type_idx" ON "Note"("babyId", "type");

-- CreateIndex
CREATE INDEX "Note_babyId_dueDate_idx" ON "Note"("babyId", "dueDate");

-- CreateIndex
CREATE INDEX "Note_babyId_completed_idx" ON "Note"("babyId", "completed");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
