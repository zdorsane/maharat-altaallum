-- AlterTable
ALTER TABLE "Case" ALTER COLUMN "firstNoticed" DROP NOT NULL,
ALTER COLUMN "situations" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "schoolName" TEXT;

-- AlterTable
ALTER TABLE "Specialist" ADD COLUMN     "consultationModes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "photo" BYTEA,
ADD COLUMN     "photoMime" TEXT;

-- CreateTable
CREATE TABLE "SpecialistDocument" (
    "id" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialistDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DifficultyAssessment" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "caseId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "items" TEXT NOT NULL DEFAULT '',
    "clearSections" TEXT NOT NULL DEFAULT '',
    "summary" TEXT,
    "priorSupport" TEXT,
    "priorSupportDetails" TEXT,
    "consultationMode" TEXT,
    "consultationNote" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DifficultyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpecialistDocument_specialistId_idx" ON "SpecialistDocument"("specialistId");

-- CreateIndex
CREATE UNIQUE INDEX "DifficultyAssessment_caseId_key" ON "DifficultyAssessment"("caseId");

-- CreateIndex
CREATE INDEX "DifficultyAssessment_childId_status_idx" ON "DifficultyAssessment"("childId", "status");

-- AddForeignKey
ALTER TABLE "SpecialistDocument" ADD CONSTRAINT "SpecialistDocument_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "Specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DifficultyAssessment" ADD CONSTRAINT "DifficultyAssessment_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DifficultyAssessment" ADD CONSTRAINT "DifficultyAssessment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

