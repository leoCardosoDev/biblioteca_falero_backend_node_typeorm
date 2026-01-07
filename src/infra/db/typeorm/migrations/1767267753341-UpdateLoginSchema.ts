import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLoginSchema1767267753341 implements MigrationInterface {
    name = 'UpdateLoginSchema1767267753341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`DROP INDEX \`UQ_230b925048540454c8b4c481e1c\` ON \`users\``);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`DROP INDEX \`UQ_97672ac88f789774dd47f7c8be3\` ON \`users\``);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`DROP INDEX \`UQ_5c5dcf2d3a6675ddbc6cd3afd55\` ON \`state\``);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`DROP INDEX \`IDX_SESSION_TOKEN_HASH\` ON \`user_sessions\``);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`DROP INDEX \`IDX_SESSION_USER_ID\` ON \`user_sessions\``);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`DROP INDEX \`uq_city_name_state\` ON \`city\``);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`DROP INDEX \`uq_neighborhood_name_city\` ON \`neighborhood\``);
        } catch (_e) { void _e }
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`status\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_230b925048540454c8b4c481e1\` (\`cpf\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address_neighborhood_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address_neighborhood_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address_city_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address_city_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`state\` ADD UNIQUE INDEX \`IDX_5c5dcf2d3a6675ddbc6cd3afd5\` (\`uf\`)`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`ipAddress\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`ipAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`userAgent\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`userAgent\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`city\` DROP COLUMN \`state_id\``);
        await queryRunner.query(`ALTER TABLE \`city\` ADD \`state_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`city_id\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`city_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`logins\` CHANGE \`role\` \`role\` varchar(255) NOT NULL`);
        try {
            await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_d2dd8af8dc964bf1375377ae32\` ON \`city\` (\`name\`, \`state_id\`)`);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_58e79c3c54d8d023a38091a167\` ON \`neighborhood\` (\`name\`, \`city_id\`)`);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`ALTER TABLE \`city\` ADD CONSTRAINT \`FK_37ecd8addf395545dcb0242a593\` FOREIGN KEY (\`state_id\`) REFERENCES \`state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (_e) { void _e }
        try {
            await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD CONSTRAINT \`FK_afa8388e34d9117a5ec01da4764\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (_e) { void _e }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP FOREIGN KEY \`FK_afa8388e34d9117a5ec01da4764\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP FOREIGN KEY \`FK_37ecd8addf395545dcb0242a593\``);
        await queryRunner.query(`DROP INDEX \`IDX_58e79c3c54d8d023a38091a167\` ON \`neighborhood\``);
        await queryRunner.query(`DROP INDEX \`IDX_d2dd8af8dc964bf1375377ae32\` ON \`city\``);
        await queryRunner.query(`ALTER TABLE \`logins\` CHANGE \`role\` \`role\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`city_id\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`city_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`city\` DROP COLUMN \`state_id\``);
        await queryRunner.query(`ALTER TABLE \`city\` ADD \`state_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` CHANGE \`createdAt\` \`createdAt\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`userAgent\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`userAgent\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`ipAddress\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`ipAddress\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`userId\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`state\` DROP INDEX \`IDX_5c5dcf2d3a6675ddbc6cd3afd5\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address_city_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address_city_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address_neighborhood_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address_neighborhood_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_230b925048540454c8b4c481e1\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` varchar(20) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role\` varchar(20) NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_neighborhood_name_city\` ON \`neighborhood\` (\`name\`, \`city_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_city_name_state\` ON \`city\` (\`name\`, \`state_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_SESSION_USER_ID\` ON \`user_sessions\` (\`userId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_SESSION_TOKEN_HASH\` ON \`user_sessions\` (\`refreshTokenHash\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_5c5dcf2d3a6675ddbc6cd3afd55\` ON \`state\` (\`uf\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_97672ac88f789774dd47f7c8be3\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_230b925048540454c8b4c481e1c\` ON \`users\` (\`cpf\`)`);
    }

}
