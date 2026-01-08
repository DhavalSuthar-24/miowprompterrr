-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "remixCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
