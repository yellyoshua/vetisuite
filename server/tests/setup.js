import {afterAll, beforeAll, vi} from 'vitest';

vi.mock('@/utils/events.js', () => ({
  default: {
    emailAccountManager: {publish: vi.fn().mockResolvedValue(true)}
  }
}));

vi.mock('@vetisuite/database/db.js', async () => {
  const [{drizzle, PGlite}, schemas] = await Promise.all([
    import('@vetisuite/database/pglite.js'),
    import('@vetisuite/database/schemas/schemas.js')
  ]);

  return {db: drizzle({client: new PGlite(), schema: schemas, casing: 'snake_case'})};
});

process.env.APP_ENV = 'development';
process.env.IS_LOCAL = 'true';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.X_IS_TESTING_MODE = 'true';
process.env.VETISUITE_API_DOMAIN = 'http://localhost:4000';
process.env.VETISUITE_APP_DOMAIN = 'http://localhost:5173';

beforeAll(async () => {
  const {loadSchemas} = await import('./fixtures.js');

  await loadSchemas();
});

afterAll(async () => {
  const {db} = await import('@vetisuite/database/db.js');

  await db.$client.close();
});
