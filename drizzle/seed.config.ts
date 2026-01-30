import * as crypto from "crypto";

function getPassword(envVar: string, defaultLength: number = 16): string {
  return process.env[envVar] || crypto.randomBytes(defaultLength).toString("base64").slice(0, defaultLength);
}
export const ADMIN_USER = {
  name: "Administrateur",
  email: "admin@imulator.com", 
  password: getPassword("ADMIN_USER_PASSWORD")
};

export const SEED_USERS = [
  {
    name: "Test User",
    email: "test@imulator.com",
    password: getPassword("TEST_USER_PASSWORD")
  },
  {
    name: "Demo User", 
    email: "demo@imulator.com",
    password: getPassword("DEMO_USER_PASSWORD")
  }
];