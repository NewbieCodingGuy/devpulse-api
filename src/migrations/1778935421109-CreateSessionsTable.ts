import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSessionsTable1778935421109 implements MigrationInterface {
    name = 'CreateSessionsTable1778935421109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`sessions\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`title\` varchar(150) NOT NULL, \`startTime\` datetime NOT NULL, \`endTime\` datetime NULL, \`duration\` int NULL, \`language\` varchar(255) NOT NULL, \`notes\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_57de40bc620f456c7311aa3a1e6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_57de40bc620f456c7311aa3a1e6\``);
        await queryRunner.query(`DROP TABLE \`sessions\``);
    }

}
