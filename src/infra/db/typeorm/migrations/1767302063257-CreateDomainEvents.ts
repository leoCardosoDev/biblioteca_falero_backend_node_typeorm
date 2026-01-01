import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDomainEvents1767302063257 implements MigrationInterface {
    name = 'CreateDomainEvents1767302063257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`domain_events\` (\`id\` varchar(36) NOT NULL, \`aggregate_id\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`payload\` json NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_a2f6fc566626c216ae4dbe4f4a\` (\`aggregate_id\`), INDEX \`IDX_47d752799578168fadadb66080\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_47d752799578168fadadb66080\` ON \`domain_events\``);
        await queryRunner.query(`DROP INDEX \`IDX_a2f6fc566626c216ae4dbe4f4a\` ON \`domain_events\``);
        await queryRunner.query(`DROP TABLE \`domain_events\``);
    }

}
