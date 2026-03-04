import { defineConfig } from 'drizzle-kit';
import { env } from './app/server/utils/env.server';

export default defineConfig({
  schema: './app/server/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});
