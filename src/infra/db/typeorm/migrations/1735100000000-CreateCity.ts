import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateCity1735100000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "city",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isPrimary: true
        },
        {
          name: "name",
          type: "varchar",
          length: "255",
          isNullable: false
        },
        {
          name: "state_id",
          type: "varchar",
          length: "36",
          isNullable: false
        }
      ]
    }))

    // FIXME: Foreign key creation fails with MySQL error. Disabling for now.
    /*
    await queryRunner.createForeignKey("city", new TableForeignKey({
        name: "fk_city_state",
        columnNames: ["state_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "state",
        onDelete: "RESTRICT"
    }))
    */

    await queryRunner.createIndex("city", new TableIndex({
      name: "uq_city_name_state",
      columnNames: ["name", "state_id"],
      isUnique: true
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("city", "uq_city_name_state")
    // await queryRunner.dropForeignKey("city", "fk_city_state")
    await queryRunner.dropTable("city")
  }

}
