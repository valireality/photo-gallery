import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    ALTER TABLE "library"
      ADD COLUMN "spaceId" uuid,
      ADD CONSTRAINT "library_spaceId_fkey"
        FOREIGN KEY ("spaceId") REFERENCES "shared_space" ("id") ON DELETE CASCADE;
  `.execute(db);
  await sql`CREATE UNIQUE INDEX "library_spaceId_unique" ON "library" ("spaceId") WHERE "spaceId" IS NOT NULL;`.execute(
    db,
  );

  await sql`
    ALTER TABLE "album"
      ADD COLUMN "spaceId" uuid,
      ADD CONSTRAINT "album_spaceId_fkey"
        FOREIGN KEY ("spaceId") REFERENCES "shared_space" ("id") ON DELETE CASCADE;
  `.execute(db);
  await sql`CREATE INDEX "album_spaceId_idx" ON "album" ("spaceId") WHERE "spaceId" IS NOT NULL;`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX "album_spaceId_idx";`.execute(db);
  await sql`ALTER TABLE "album" DROP CONSTRAINT "album_spaceId_fkey", DROP COLUMN "spaceId";`.execute(db);
  await sql`DROP INDEX "library_spaceId_unique";`.execute(db);
  await sql`ALTER TABLE "library" DROP CONSTRAINT "library_spaceId_fkey", DROP COLUMN "spaceId";`.execute(db);
}
