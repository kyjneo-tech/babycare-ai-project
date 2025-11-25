-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "permission" TEXT NOT NULL DEFAULT 'member';

-- Set the first member of each family (by createdAt) as owner
UPDATE "FamilyMember" AS fm
SET "permission" = 'owner'
WHERE fm."createdAt" = (
  SELECT MIN("createdAt") 
  FROM "FamilyMember" 
  WHERE "familyId" = fm."familyId"
);
