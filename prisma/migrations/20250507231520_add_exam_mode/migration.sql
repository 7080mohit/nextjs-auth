-- AlterTable
ALTER TABLE `timetable` ADD COLUMN `exam_mode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `metadata` TEXT NULL;
