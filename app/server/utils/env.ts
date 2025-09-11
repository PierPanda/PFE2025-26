import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string(),
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

const isServer = typeof window === "undefined";

export const env = isServer
  ? envSchema.parse(process.env)
  : {
      BETTER_AUTH_URL: import.meta.env.BETTER_AUTH_URL,
      BETTER_AUTH_SECRET: import.meta.env.BETTER_AUTH_SECRET,
      DATABASE_URL: import.meta.env.DATABASE_URL,
      NODE_ENV: "development" as const,
    };
