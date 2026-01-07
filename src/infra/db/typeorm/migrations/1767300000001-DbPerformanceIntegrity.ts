import { MigrationInterface, QueryRunner } from "typeorm";

export class DbPerformanceIntegrity1767300000001 implements MigrationInterface {
  name = 'DbPerformanceIntegrity1767300000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`version\` INT NOT NULL DEFAULT 0`);

    await queryRunner.query(`CREATE INDEX \`IDX_logins_userId\` ON \`logins\` (\`userId\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_logins_role\` ON \`logins\` (\`role\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_logins_role\` ON \`logins\``);
    await queryRunner.query(`DROP INDEX \`IDX_logins_userId\` ON \`logins\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`version\``);
  }
}
