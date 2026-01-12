import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm'

export class CreateStrictGeoFks1767307000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_state_id',
        type: 'varchar',
        length: '36',
        isNullable: true
      })
    )


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

    await queryRunner.dropForeignKey('neighborhood', 'fk_neighborhood_city')


    await queryRunner.dropForeignKey('city', 'fk_city_state')


    await queryRunner.dropForeignKey('users', 'fk_users_address_neighborhood')
    await queryRunner.dropForeignKey('users', 'fk_users_address_city')
    await queryRunner.dropForeignKey('users', 'fk_users_address_state')


    await queryRunner.dropColumn('users', 'address_state_id')
  }
}
