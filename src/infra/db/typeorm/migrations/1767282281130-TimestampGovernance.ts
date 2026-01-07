import { MigrationInterface, QueryRunner } from "typeorm";

export class TimestampGovernance1767282281130 implements MigrationInterface {
    name = 'TimestampGovernance1767282281130'

    public async up(queryRunner: QueryRunner): Promise<void> {

        try {
            await queryRunner.query(`DROP INDEX \`uq_city_name_state\` ON \`city\``);
        } catch (_e) { void _e }

        try {
            await queryRunner.query(`DROP INDEX \`uq_neighborhood_name_city\` ON \`neighborhood\``);
        } catch (_e) { void _e }

        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);

        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);

        await queryRunner.query(`ALTER TABLE \`city\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);

        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);

        await queryRunner.query(`ALTER TABLE \`logins\` CHANGE \`role\` \`role\` varchar(255) NULL`);

        await queryRunner.query(`ALTER TABLE \`city\` MODIFY \`state_id\` varchar(255) NOT NULL`);

        await queryRunner.query(`ALTER TABLE \`neighborhood\` MODIFY \`city_id\` varchar(255) NOT NULL`);

        await queryRunner.query(`ALTER TABLE \`neighborhood\` MODIFY \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);

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

        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);

        await queryRunner.query(`ALTER TABLE \`logins\` CHANGE \`role\` \`role\` varchar(255) NOT NULL`);

    }

}
