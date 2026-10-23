import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1792178283481 implements MigrationInterface {
  name = 'AutoMigration1792178283481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "report_requests" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "created_by" text NOT NULL DEFAULT ('system'), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_by" text NOT NULL DEFAULT ('system'), "type" text NOT NULL, "payload" text NOT NULL, "status" text NOT NULL DEFAULT ('PENDING'), "file_path" text, "error_message" text)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "report_requests"`);
  }
}
