import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../app/server/lib/db/schema";
import { auth } from "../app/server/lib/auth";
import { ADMIN_USER, SEED_USERS } from "./seed.config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL est requis dans votre fichier .env");
  process.exit(1);
}

const client = neon(DATABASE_URL);
const db = drizzle(client, { schema });

const allUsers = [ADMIN_USER, ...SEED_USERS];
const shouldReset = process.argv.includes("--reset");

async function resetUsers() {
  console.log("Purge des tables...");
  await db.execute(sql`DELETE FROM "session"`);
  await db.execute(sql`DELETE FROM "account"`);
  await db.execute(sql`DELETE FROM "verification"`);
  await db.execute(sql`DELETE FROM "user"`);
  console.log("Tables purgees.\n");
}

async function seed() {
  console.log("Demarrage du seeding...\n");

  if (shouldReset) {
    await resetUsers();
  }

  for (const userData of allUsers) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });

      if (result?.user) {
        console.log(`[OK] ${userData.name} cree (${userData.email})`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("already") || message.includes("User")) {
        console.log(`[SKIP] ${userData.email} existe deja`);
      } else {
        console.error(`[ERR] ${userData.email}: ${message}`);
      }
    }
  }
}

seed()
  .then(() => {
    console.log("\nSeeding termine !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
  });
