import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiSummaryToSessions1779537403846 implements MigrationInterface {
    name = 'AddAiSummaryToSessions1779537403846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`aiSummary\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_57de40bc620f456c7311aa3a1e6\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`userId\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`startTime\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`endTime\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`notes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_57de40bc620f456c7311aa3a1e6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_57de40bc620f456c7311aa3a1e6\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`notes\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`notes\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`endTime\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`startTime\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_57de40bc620f456c7311aa3a1e6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`aiSummary\``);
    }

}
