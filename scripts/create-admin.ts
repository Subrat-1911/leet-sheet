import "dotenv/config";
import bcrypt from "bcryptjs";

import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../src/prisma/contract";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

const db = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL,
});

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env"
    );
  }

  if (password.length < 8) {
    throw new Error("Admin password must be at least 8 characters long.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await db.orm.public.AdminUser
    .where({ username })
    .first();

  if (existingAdmin) {
    throw new Error(`Admin "${username}" already exists.`);
  }

  await db.orm.public.AdminUser.create({
    username,
    passwordHash,
  });

  console.log(`Admin "${username}" created successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});