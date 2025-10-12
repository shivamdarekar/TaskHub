-- AlterTable
ALTER TABLE `user` ADD COLUMN `passwordResetOtp` VARCHAR(191) NULL,
    ADD COLUMN `passwordResetOtpExpires` DATETIME(3) NULL;
