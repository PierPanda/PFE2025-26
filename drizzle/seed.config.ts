export const ADMIN_USER = {
  name: "Administrateur",
  email: "admin@admin.com",
  password: process.env.ADMIN_USER_PASSWORD || "Passwordd!",
};

export const SEED_USERS = [
  {
    name: "Test User",
    email: "test@test.com",
    password: process.env.TEST_USER_PASSWORD || "Passwordd",
  },
  {
    name: "Demo User",
    email: "demo@demo.com",
    password: process.env.DEMO_USER_PASSWORD || "Passwordd!",
  },
];
