import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddPowerLevelToRoles1767306000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('roles', new TableColumn({
      name: 'power_level',
      type: 'int',
      default: 0,
      isNullable: false
    }))

    // Seed data updates
    await queryRunner.query("UPDATE roles SET power_level = 100 WHERE slug = 'ADMIN'")
    await queryRunner.query("UPDATE roles SET power_level = 50 WHERE slug = 'LIBRARIAN'")
    await queryRunner.query("UPDATE roles SET power_level = 10 WHERE slug = 'MEMBER'")
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('roles', 'power_level')
  }
}
