import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteAndStatusToUser1767300000000 implements MigrationInterface {
  name = 'AddSoftDeleteAndStatusToUser1767300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` varchar(20) NOT NULL DEFAULT 'ACTIVE'`);
    await queryRunner.query(`ALTER TABLE \`logins\` ADD \`deleted_at\` datetime NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`logins\` DROP COLUMN \`deleted_at\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
  }
}
