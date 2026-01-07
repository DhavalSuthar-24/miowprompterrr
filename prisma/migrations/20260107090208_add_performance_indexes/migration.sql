-- CreateIndex
CREATE INDEX "Comment_promptId_idx" ON "Comment"("promptId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Personality_sortOrder_isActive_idx" ON "Personality"("sortOrder", "isActive");

-- CreateIndex
CREATE INDEX "Personality_slug_idx" ON "Personality"("slug");

-- CreateIndex
CREATE INDEX "Prompt_createdAt_idx" ON "Prompt"("createdAt");

-- CreateIndex
CREATE INDEX "Prompt_score_idx" ON "Prompt"("score");

-- CreateIndex
CREATE INDEX "Prompt_authorId_idx" ON "Prompt"("authorId");

-- CreateIndex
CREATE INDEX "Prompt_status_idx" ON "Prompt"("status");

-- CreateIndex
CREATE INDEX "SelectOption_type_isActive_idx" ON "SelectOption"("type", "isActive");
