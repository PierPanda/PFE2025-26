import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string(),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse({
  BETTER_AUTH_URL: import.meta.env.VITE_BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: import.meta.env.VITE_BETTER_AUTH_SECRET,
  DATABASE_URL: import.meta.env.VITE_DATABASE_URL,
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
});

if (!parsed.success) {
  throw new Error("Invalid environment variables");
}

const env = parsed.data;

export { env };
