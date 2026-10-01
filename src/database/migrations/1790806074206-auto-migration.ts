import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1790806074206 implements MigrationInterface {
    name = 'AutoMigration1790806074206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_configs_database_ref_id_enterprise_ref_id" ON "enterprise_configs" ("database", "reference_id", "enterprise_ref_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "uq_configs_database_ref_id_enterprise_ref_id"`);
    }

}
