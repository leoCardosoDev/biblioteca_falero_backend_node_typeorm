import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateUserSessionsTable1735134000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_sessions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: false
          },
          {
            name: 'refreshTokenHash',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'expiresAt',
            type: 'datetime',
            isNullable: false
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: true
          },
          {
            name: 'userAgent',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'isValid',
            type: 'boolean',
            default: true
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        indices: [
          {
            name: 'IDX_SESSION_USER_ID',
            columnNames: ['userId']
          },
          {
            name: 'IDX_SESSION_TOKEN_HASH',
            columnNames: ['refreshTokenHash']
          }
        ]
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_sessions')
  }
}
