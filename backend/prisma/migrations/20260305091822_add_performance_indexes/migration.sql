-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "public"."Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_projectId_createdAt_idx" ON "public"."Activity"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_taskId_idx" ON "public"."Comment"("taskId");

-- CreateIndex
CREATE INDEX "Comment_taskId_createdAt_idx" ON "public"."Comment"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_createdBy_idx" ON "public"."Project"("createdBy");

-- CreateIndex
CREATE INDEX "Project_workspaceId_createdAt_idx" ON "public"."Project"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectAccess_projectId_hasAccess_idx" ON "public"."ProjectAccess"("projectId", "hasAccess");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "public"."Task"("status");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "public"."Task"("createdAt");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "public"."Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "public"."Task"("priority");

-- CreateIndex
CREATE INDEX "Task_projectId_status_idx" ON "public"."Task"("projectId", "status");

-- CreateIndex
CREATE INDEX "Task_projectId_createdAt_idx" ON "public"."Task"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_dueDate_status_idx" ON "public"."Task"("dueDate", "status");

-- CreateIndex
CREATE INDEX "WorkSpace_ownerId_idx" ON "public"."WorkSpace"("ownerId");

-- CreateIndex
CREATE INDEX "WorkspaceMembers_workspaceId_createdAt_idx" ON "public"."WorkspaceMembers"("workspaceId", "createdAt");
