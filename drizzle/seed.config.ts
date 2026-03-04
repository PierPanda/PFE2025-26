export const ADMIN_USER = {
  name: "Administrateur",
  email: "admin@admin.com",
  password: process.env.ADMIN_USER_PASSWORD || "Admin123!",
};

export const SEED_USERS = [
  {
    name: "Test User",
    email: "test@test.com",
    password: process.env.TEST_USER_PASSWORD || "Test123!",
  },
  {
    name: "Demo User",
    email: "demo@demo.com",
    password: process.env.DEMO_USER_PASSWORD || "Demo123!",
  },
];
