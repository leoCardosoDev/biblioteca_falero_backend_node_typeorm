import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm'

export class CreateStrictGeoFks1767307000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add address_state_id to users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_state_id',
        type: 'varchar',
        length: '36',
        isNullable: true
      })
    )

    // 2. Add FKs to users
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'fk_users_address_state',
        columnNames: ['address_state_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'state',
        onDelete: 'SET NULL'
      })
    )

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'fk_users_address_city',
        columnNames: ['address_city_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'city',
        onDelete: 'SET NULL'
      })
    )

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'fk_users_address_neighborhood',
        columnNames: ['address_neighborhood_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'neighborhood',
        onDelete: 'SET NULL'
      })
    )

    // 3. Add FKs to Geo Tables (City -> State, Neighborhood -> City)
    await queryRunner.createForeignKey(
      'city',
      new TableForeignKey({
        name: 'fk_city_state',
        columnNames: ['state_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'state',
        onDelete: 'CASCADE'
      })
    )

    await queryRunner.createForeignKey(
      'neighborhood',
      new TableForeignKey({
        name: 'fk_neighborhood_city',
        columnNames: ['city_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'city',
        onDelete: 'CASCADE'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FKs from neighborhood
    await queryRunner.dropForeignKey('neighborhood', 'fk_neighborhood_city')

    // Drop FKs from city
    await queryRunner.dropForeignKey('city', 'fk_city_state')

    // Drop FKs from users
    await queryRunner.dropForeignKey('users', 'fk_users_address_neighborhood')
    await queryRunner.dropForeignKey('users', 'fk_users_address_city')
    await queryRunner.dropForeignKey('users', 'fk_users_address_state')

    // Drop column address_state_id
    await queryRunner.dropColumn('users', 'address_state_id')
  }
}
