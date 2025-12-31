import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddRoleAndStatusToUsers1735581600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'role',
        type: 'varchar',
        length: '20',
        default: "'user'",
        isNullable: false
      }),
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        default: "'active'",
        isNullable: false
      })
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'role')
    await queryRunner.dropColumn('users', 'status')
  }
}
