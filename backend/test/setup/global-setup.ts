/**
 * Jest globalSetup  —  runs once before any test suite in the e2e run.
 *
 * Starts a throwaway PostgreSQL container, applies the Prisma schema
 * (prisma db push), then writes the container's connection URL into
 * process.env so every test suite connects to the isolated DB.
 *
 * The container instance is stashed in global.__TC_CONTAINER__ so the
 * matching globalTeardown can stop it.
 */
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __TC_CONTAINER__: StartedPostgreSqlContainer;
}

export default async function globalSetup() {
  console.log('\n🐳  Starting PostgreSQL test container...');

  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  global.__TC_CONTAINER__ = container;

  // Standard connection URL — no pooler, so Prisma db push works directly
  const dbUrl = container.getConnectionUri();

  // Expose to child processes (NestJS app + Prisma CLI)
  process.env.DATABASE_URL = dbUrl;
  process.env.DIRECT_URL = dbUrl;   // schema.prisma uses directUrl as well

  console.log(`✅  Container started: ${dbUrl}`);

  // Push the Prisma schema onto the fresh container DB
  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  console.log('📦  Applying schema with prisma db push...');
  execSync(
    `npx prisma db push --schema="${schemaPath}" --skip-generate`,
    {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
        DIRECT_URL: dbUrl,
      },
      stdio: 'inherit',
    },
  );

  console.log('✅  Schema applied — test DB ready.\n');
}
