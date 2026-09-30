import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1790803023261 implements MigrationInterface {
    name = 'AutoMigration1790803023261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "enterprises" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text NOT NULL DEFAULT ('system'), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text NOT NULL DEFAULT ('system'), "name" text NOT NULL, "description" text, "color" text, "image" text)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "enterprises"`);
    }

}
