-- CreateTable
CREATE TABLE `WorkspaceInvite` (
    `id` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `inviteToken` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `invitedBy` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WorkspaceInvite_inviteToken_key`(`inviteToken`),
    INDEX `WorkspaceInvite_workspaceId_idx`(`workspaceId`),
    INDEX `WorkspaceInvite_inviteToken_idx`(`inviteToken`),
    INDEX `WorkspaceInvite_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkspaceInvite` ADD CONSTRAINT `WorkspaceInvite_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `WorkSpace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceInvite` ADD CONSTRAINT `WorkspaceInvite_invitedBy_fkey` FOREIGN KEY (`invitedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
