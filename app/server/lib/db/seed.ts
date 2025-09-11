import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { user, account } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { ADMIN_USER, SEED_USERS } from "./seed.config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL est requis dans votre fichier .env");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}) {
  const userId = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // Insérer l'utilisateur
  await db.insert(user).values({
    id: userId,
    name: userData.name,
    email: userData.email,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insérer le compte avec mot de passe
  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return userId;
}

async function seed() {
  console.log("🌱 Démarrage du seeding...");

  try {
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_USER.email))
      .limit(1);

    if (existingAdmin.length === 0) {
      await createUser(ADMIN_USER);
      console.log("✅ Utilisateur admin créé !");
      console.log(`📧 Email: ${ADMIN_USER.email}`);
      // console.log(`🔐 Mot de passe: ${ADMIN_USER.password}`); // Removed for security
    } else {
      console.log("👤 L'utilisateur admin existe déjà");
    }

    for (const userData of SEED_USERS) {
      const existing = await db
        .select()
        .from(user)
        .where(eq(user.email, userData.email))
        .limit(1);

      if (existing.length === 0) {
        await createUser(userData);
        console.log(`✅ Utilisateur ${userData.name} créé (${userData.email})`);
      } else {
        console.log(`👤 L'utilisateur ${userData.email} existe déjà`);
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("🎉 Seeding terminé !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });

export { seed };
