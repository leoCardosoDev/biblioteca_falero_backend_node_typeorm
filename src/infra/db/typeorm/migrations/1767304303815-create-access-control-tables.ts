import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccessControlTables1767304303815 implements MigrationInterface {
    name = 'CreateAccessControlTables1767304303815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`DROP INDEX \`IDX_logins_role\` ON \`logins\``);
        } catch (_e) { /* ignore */ }
        try {
            await queryRunner.query(`DROP INDEX \`IDX_logins_userId\` ON \`logins\``);
        } catch (_e) { /* ignore */ }
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` varchar(36) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d090ad82a0e97ce764c06c7b31\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` varchar(36) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_881f72bac969d9a00a1a29e107\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`role_id\` varchar(36) NOT NULL, \`permission_id\` varchar(36) NOT NULL, INDEX \`IDX_178199805b901ccd220ab7740e\` (\`role_id\`), INDEX \`IDX_17022daf3f885f7d35423e9971\` (\`permission_id\`), PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`role_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`user_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`version\` \`version\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_9e8c972b998b0a954ca819dfb5\` ON \`logins\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD CONSTRAINT \`FK_0e408d84ae12f09902e076b3e1d\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD CONSTRAINT \`FK_9e8c972b998b0a954ca819dfb51\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP FOREIGN KEY \`FK_9e8c972b998b0a954ca819dfb51\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP FOREIGN KEY \`FK_0e408d84ae12f09902e076b3e1d\``);
        await queryRunner.query(`DROP INDEX \`IDX_9e8c972b998b0a954ca819dfb5\` ON \`logins\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`version\` \`version\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`role\` varchar(255) NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_881f72bac969d9a00a1a29e107\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_d090ad82a0e97ce764c06c7b31\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`CREATE INDEX \`IDX_logins_userId\` ON \`logins\` (\`userId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_logins_role\` ON \`logins\` (\`role\`)`);
    }

}
