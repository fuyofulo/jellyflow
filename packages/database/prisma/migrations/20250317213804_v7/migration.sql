-- AlterTable
ALTER TABLE "Zap" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastEdited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
