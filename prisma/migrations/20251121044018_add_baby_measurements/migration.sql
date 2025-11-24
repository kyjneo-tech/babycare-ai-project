-- CreateTable
CREATE TABLE "BabyMeasurement" (
    "id" TEXT NOT NULL,
    "babyId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BabyMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BabyMeasurement_babyId_measuredAt_idx" ON "BabyMeasurement"("babyId", "measuredAt" DESC);

-- AddForeignKey
ALTER TABLE "BabyMeasurement" ADD CONSTRAINT "BabyMeasurement_babyId_fkey" FOREIGN KEY ("babyId") REFERENCES "Baby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
