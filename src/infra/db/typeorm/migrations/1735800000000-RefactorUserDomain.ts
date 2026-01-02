import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class RefactorUserDomain1735800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.dropColumn('users', 'address_state')

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'gender',
        type: 'varchar',
        length: '255',
        isNullable: false
      })
    )

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '255',
        isNullable: true
      })
    )

    await queryRunner.dropColumn('users', 'address_city')
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_city_id',
        type: 'varchar',
        length: '36',
        isNullable: true
      })
    )

    await queryRunner.dropColumn('users', 'address_neighborhood')
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_neighborhood_id',
        type: 'varchar',
        length: '36',
        isNullable: true
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'address_neighborhood_id')
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_neighborhood',
        type: 'varchar',
        length: '255',
        isNullable: true
      })
    )

    await queryRunner.dropColumn('users', 'address_city_id')
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_city',
        type: 'varchar',
        length: '255',
        isNullable: true
      })
    )

    await queryRunner.dropColumn('users', 'phone')
    await queryRunner.dropColumn('users', 'gender')

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address_state',
        type: 'varchar',
        length: '255',
        isNullable: true
      })
    )


  }
}
