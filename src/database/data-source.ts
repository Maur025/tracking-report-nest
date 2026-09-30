import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_URL ?? 'db.sqlite',

  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});
