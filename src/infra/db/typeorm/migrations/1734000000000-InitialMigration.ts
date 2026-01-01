import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class InitialMigration1734000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'rg', type: 'varchar', length: '255', isNullable: false },
          { name: 'cpf', type: 'varchar', length: '255', isUnique: true, isNullable: false },

          { name: 'address_street', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_number', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_complement', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_neighborhood', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_city', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_state', type: 'varchar', length: '255', isNullable: true },
          { name: 'address_zip_code', type: 'varchar', length: '255', isNullable: true }
        ]
      }),
      true
    )

    // Create logins table
    await queryRunner.createTable(
      new Table({
        name: 'logins',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'password', type: 'varchar', length: '255', isNullable: false },
          { name: 'role', type: 'varchar', length: '255', isNullable: true },
          { name: 'accessToken', type: 'varchar', length: '255', isNullable: true },
          { name: 'userId', type: 'varchar', length: '255', isNullable: false }
        ]
      }),
      true
    )

    // Create user_sessions table
    await queryRunner.createTable(
      new Table({
        name: 'user_sessions',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'userId', type: 'varchar', length: '255', isNullable: false },
          { name: 'refreshTokenHash', type: 'varchar', length: '255', isNullable: false },
          { name: 'expiresAt', type: 'datetime', isNullable: false },
          { name: 'ipAddress', type: 'varchar', length: '255', isNullable: true },
          { name: 'userAgent', type: 'varchar', length: '255', isNullable: true },
          { name: 'isValid', type: 'boolean', default: true },
          { name: 'createdAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)' }
        ]
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_sessions')
    await queryRunner.dropTable('logins')
    await queryRunner.dropTable('users')
  }
}
