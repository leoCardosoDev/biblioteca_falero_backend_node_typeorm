import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateNeighborhood1735688400000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "neighborhood",
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
          name: "city_id",
          type: "varchar",
          length: "36",
          isNullable: false
        },
        {
          name: "created_at",
          type: "timestamp",
          default: "now()"
        }
      ]
    }))

    await queryRunner.createIndex("neighborhood", new TableIndex({
      name: "uq_neighborhood_name_city",
      columnNames: ["name", "city_id"],
      isUnique: true
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("neighborhood", "uq_neighborhood_name_city")
    
    await queryRunner.dropTable("neighborhood")
  }

}
