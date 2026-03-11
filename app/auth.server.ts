import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { db } from '~/server/lib/db/index.server';
import * as schema from '~/server/lib/db/schema';
import { env } from '~/server/utils/env.server';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins:
    env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
      : [env.BETTER_AUTH_URL],
  logger: {
    level: 'debug',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [admin()],
});
