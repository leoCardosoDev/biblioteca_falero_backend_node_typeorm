import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateState1767220000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'state',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'uf',
            type: 'varchar',
            length: '2',
            isNullable: false,
            isUnique: true
          }
        ]
      }),
      true
    )

    // Seed Data
    await queryRunner.query(`
      INSERT INTO state (id, name, uf) VALUES
      (uuid(), 'Acre', 'AC'),
      (uuid(), 'Alagoas', 'AL'),
      (uuid(), 'Amapá', 'AP'),
      (uuid(), 'Amazonas', 'AM'),
      (uuid(), 'Bahia', 'BA'),
      (uuid(), 'Ceará', 'CE'),
      (uuid(), 'Distrito Federal', 'DF'),
      (uuid(), 'Espírito Santo', 'ES'),
      (uuid(), 'Goiás', 'GO'),
      (uuid(), 'Maranhão', 'MA'),
      (uuid(), 'Mato Grosso', 'MT'),
      (uuid(), 'Mato Grosso do Sul', 'MS'),
      (uuid(), 'Minas Gerais', 'MG'),
      (uuid(), 'Pará', 'PA'),
      (uuid(), 'Paraíba', 'PB'),
      (uuid(), 'Paraná', 'PR'),
      (uuid(), 'Pernambuco', 'PE'),
      (uuid(), 'Piauí', 'PI'),
      (uuid(), 'Rio de Janeiro', 'RJ'),
      (uuid(), 'Rio Grande do Norte', 'RN'),
      (uuid(), 'Rio Grande do Sul', 'RS'),
      (uuid(), 'Rondônia', 'RO'),
      (uuid(), 'Roraima', 'RR'),
      (uuid(), 'Santa Catarina', 'SC'),
      (uuid(), 'São Paulo', 'SP'),
      (uuid(), 'Sergipe', 'SE'),
      (uuid(), 'Tocantins', 'TO');
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('state')
  }
}
