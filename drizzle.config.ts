
import { defineConfig } from 'drizzle-kit';
import { env } from '~/env';

export default defineConfig({
  schema: './src/lib/drizzle.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});