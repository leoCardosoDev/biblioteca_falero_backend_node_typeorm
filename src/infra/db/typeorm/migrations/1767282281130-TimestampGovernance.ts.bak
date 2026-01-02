import { MigrationInterface, QueryRunner } from "typeorm";

export class TimestampGovernance1767282281130 implements MigrationInterface {
    name = 'TimestampGovernance1767282281130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`uq_city_name_state\` ON \`city\``);
        await queryRunner.query(`DROP INDEX \`uq_neighborhood_name_city\` ON \`neighborhood\``);
        await queryRunner.query(`CREATE TABLE \`state\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`uf\` varchar(2) NOT NULL, UNIQUE INDEX \`IDX_5c5dcf2d3a6675ddbc6cd3afd5\` (\`uf\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`city\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`logins\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`city\` DROP COLUMN \`state_id\``);
        await queryRunner.query(`ALTER TABLE \`city\` ADD \`state_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`city_id\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`city_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`logins\` CHANGE \`role\` \`role\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_d2dd8af8dc964bf1375377ae32\` ON \`city\` (\`name\`, \`state_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_58e79c3c54d8d023a38091a167\` ON \`neighborhood\` (\`name\`, \`city_id\`)`);
        await queryRunner.query(`ALTER TABLE \`city\` ADD CONSTRAINT \`FK_37ecd8addf395545dcb0242a593\` FOREIGN KEY (\`state_id\`) REFERENCES \`state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD CONSTRAINT \`FK_afa8388e34d9117a5ec01da4764\` FOREIGN KEY (\`city_id\`) REFERENCES \`city\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP FOREIGN KEY \`FK_afa8388e34d9117a5ec01da4764\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP FOREIGN KEY \`FK_37ecd8addf395545dcb0242a593\``);
        await queryRunner.query(`DROP INDEX \`IDX_58e79c3c54d8d023a38091a167\` ON \`neighborhood\``);
        await queryRunner.query(`DROP INDEX \`IDX_d2dd8af8dc964bf1375377ae32\` ON \`city\``);
        await queryRunner.query(`ALTER TABLE \`logins\` CHANGE \`role\` \`role\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` DROP COLUMN \`city_id\``);
        await queryRunner.query(`ALTER TABLE \`neighborhood\` ADD \`city_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`city\` DROP COLUMN \`state_id\``);
        await queryRunner.query(`ALTER TABLE \`city\` ADD \`state_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`city\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`user_sessions\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`DROP INDEX \`IDX_5c5dcf2d3a6675ddbc6cd3afd5\` ON \`state\``);
        await queryRunner.query(`DROP TABLE \`state\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_neighborhood_name_city\` ON \`neighborhood\` (\`name\`, \`city_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`uq_city_name_state\` ON \`city\` (\`name\`, \`state_id\`)`);
    }

}
