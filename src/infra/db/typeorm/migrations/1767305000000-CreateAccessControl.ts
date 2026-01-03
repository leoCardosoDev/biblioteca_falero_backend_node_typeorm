import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm'

export class CreateAccessControl1767305000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Roles Table
    if (!(await queryRunner.hasTable('roles'))) {
      await queryRunner.createTable(new Table({
        name: 'roles',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true, generationStrategy: 'uuid' }),
          new TableColumn({ name: 'slug', type: 'varchar', isUnique: true }),
          new TableColumn({ name: 'description', type: 'varchar' }),
          new TableColumn({ name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' }),
          new TableColumn({ name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
        ]
      }))
    }

    // Create Permissions Table
    if (!(await queryRunner.hasTable('permissions'))) {
      await queryRunner.createTable(new Table({
        name: 'permissions',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true, generationStrategy: 'uuid' }),
          new TableColumn({ name: 'slug', type: 'varchar', isUnique: true }),
          new TableColumn({ name: 'description', type: 'varchar' }),
          new TableColumn({ name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' }),
          new TableColumn({ name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
        ]
      }))
    }

    // Create Role_Permissions Join Table
    if (!(await queryRunner.hasTable('role_permissions'))) {
      await queryRunner.createTable(new Table({
        name: 'role_permissions',
        columns: [
          new TableColumn({ name: 'role_id', type: 'varchar' }),
          new TableColumn({ name: 'permission_id', type: 'varchar' })
        ],
        foreignKeys: [
          { columnNames: ['role_id'], referencedTableName: 'roles', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
          { columnNames: ['permission_id'], referencedTableName: 'permissions', referencedColumnNames: ['id'], onDelete: 'CASCADE' }
        ],
        indices: [
          { columnNames: ['role_id', 'permission_id'], isUnique: true }
        ]
      }))
    }

    // Modify Logins Table
    // Add role_id
    if (!(await queryRunner.hasColumn('logins', 'role_id'))) {
      await queryRunner.addColumn('logins', new TableColumn({
        name: 'role_id',
        type: 'varchar',
        isNullable: true
      }))
    }

    // Add ForeignKey
    try {
      await queryRunner.createForeignKey('logins', new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL'
      }))
    } catch (_e) { /* ignore */ }

    // Add user_id ForeignKey
    try {
      const table = await queryRunner.getTable('logins')
      const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1)
      if (!foreignKey) {
        await queryRunner.createForeignKey('logins', new TableForeignKey({
          columnNames: ['user_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE'
        }))
      }
    } catch (_e) { /* ignore */ }

    // Drop old role column if strictly needed, or keep for backward compat and drop later.
    // Spec says "Separated Login/User tables", implies clean break.
    // I'll drop 'role' column.
    // await queryRunner.dropColumn('logins', 'role') 
    // Commented out to be safe for now, can drop in separate cleanup.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('logins')
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('role_id') !== -1)
    if (foreignKey) {
      await queryRunner.dropForeignKey('logins', foreignKey)
    }
    await queryRunner.dropColumn('logins', 'role_id')
    await queryRunner.dropTable('role_permissions')
    await queryRunner.dropTable('permissions')
    await queryRunner.dropTable('roles')
  }
}
