-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `Project_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `workspaceinvite` DROP FOREIGN KEY `WorkspaceInvite_invitedBy_fkey`;

-- DropIndex
DROP INDEX `Project_createdBy_fkey` ON `project`;

-- DropIndex
DROP INDEX `Task_createdBy_fkey` ON `task`;

-- DropIndex
DROP INDEX `WorkspaceInvite_invitedBy_fkey` ON `workspaceinvite`;

-- AlterTable
ALTER TABLE `project` MODIFY `createdBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `task` MODIFY `createdBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `workspaceinvite` MODIFY `invitedBy` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceInvite` ADD CONSTRAINT `WorkspaceInvite_invitedBy_fkey` FOREIGN KEY (`invitedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
