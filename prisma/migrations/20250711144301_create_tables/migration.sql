-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `protocol` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `birth` VARCHAR(191) NOT NULL,
    `rg` VARCHAR(191) NOT NULL,
    `organ` VARCHAR(191) NOT NULL,
    `uf` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `military` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `proficiency` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tel` VARCHAR(191) NOT NULL,
    `zip` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `housenumber` VARCHAR(191) NOT NULL,
    `housecomplement` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `ufresidence` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `education` VARCHAR(191) NOT NULL,
    `course` VARCHAR(191) NOT NULL,
    `council` VARCHAR(191) NOT NULL,
    `councilnumber` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL,
    `deficiency` VARCHAR(191) NOT NULL,
    `deficiencyContext` VARCHAR(191) NULL,
    `accumulation` VARCHAR(191) NOT NULL,
    `accumulationInfo` VARCHAR(191) NULL,
    `term` BOOLEAN NOT NULL,
    `description` VARCHAR(191) NULL,
    `isValid` BOOLEAN NULL,
    `notice` VARCHAR(191) NULL,
    `regraId` INTEGER NULL,

    UNIQUE INDEX `User_regraId_key`(`regraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegrasAvaliacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regras_1` TEXT NULL,
    `regras_2` TEXT NULL,
    `regras_3` TEXT NULL,
    `regras_4` TEXT NULL,
    `regras_5` TEXT NULL,
    `description` VARCHAR(191) NULL,
    `notice` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Avaliacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `nota_maxima` INTEGER NOT NULL DEFAULT 100,
    `nota_inscrito` VARCHAR(191) NULL,
    `regraId` INTEGER NOT NULL,

    UNIQUE INDEX `Avaliacao_regraId_key`(`regraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `roles` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_regraId_fkey` FOREIGN KEY (`regraId`) REFERENCES `RegrasAvaliacao`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avaliacao` ADD CONSTRAINT `Avaliacao_regraId_fkey` FOREIGN KEY (`regraId`) REFERENCES `RegrasAvaliacao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
