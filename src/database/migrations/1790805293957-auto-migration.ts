import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1790805293957 implements MigrationInterface {
    name = 'AutoMigration1790805293957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "enterprise_configs" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text NOT NULL DEFAULT ('system'), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text NOT NULL DEFAULT ('system'), "host" text NOT NULL, "port" text NOT NULL, "database" text NOT NULL, "reference_id" text NOT NULL, "enterprise_ref_id" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_enterprise_configs" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text NOT NULL DEFAULT ('system'), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text NOT NULL DEFAULT ('system'), "host" text NOT NULL, "port" text NOT NULL, "database" text NOT NULL, "reference_id" text NOT NULL, "enterprise_ref_id" varchar NOT NULL, CONSTRAINT "FK_2270c97004bb282ff05b02b079d" FOREIGN KEY ("enterprise_ref_id") REFERENCES "enterprises" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_enterprise_configs"("id", "created_at", "created_by", "updated_at", "updated_by", "host", "port", "database", "reference_id", "enterprise_ref_id") SELECT "id", "created_at", "created_by", "updated_at", "updated_by", "host", "port", "database", "reference_id", "enterprise_ref_id" FROM "enterprise_configs"`);
        await queryRunner.query(`DROP TABLE "enterprise_configs"`);
        await queryRunner.query(`ALTER TABLE "temporary_enterprise_configs" RENAME TO "enterprise_configs"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enterprise_configs" RENAME TO "temporary_enterprise_configs"`);
        await queryRunner.query(`CREATE TABLE "enterprise_configs" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text NOT NULL DEFAULT ('system'), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text NOT NULL DEFAULT ('system'), "host" text NOT NULL, "port" text NOT NULL, "database" text NOT NULL, "reference_id" text NOT NULL, "enterprise_ref_id" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "enterprise_configs"("id", "created_at", "created_by", "updated_at", "updated_by", "host", "port", "database", "reference_id", "enterprise_ref_id") SELECT "id", "created_at", "created_by", "updated_at", "updated_by", "host", "port", "database", "reference_id", "enterprise_ref_id" FROM "temporary_enterprise_configs"`);
        await queryRunner.query(`DROP TABLE "temporary_enterprise_configs"`);
        await queryRunner.query(`DROP TABLE "enterprise_configs"`);
    }

}
