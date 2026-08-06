import bcryptjs from "bcryptjs";
import { prisma } from "../lib/prisma";

const SEED_PASSWORD = "Password123!";

async function hashPassword(password: string) {
  return bcryptjs.hash(password, 12);
}

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@verdemarea.test" },
    update: {},
    create: {
      email: "superadmin@verdemarea.test",
      passwordHash,
      name: "Verde Marea Super Admin",
      role: "super_admin",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@verdemarea.test" },
    update: {},
    create: {
      email: "admin@verdemarea.test",
      passwordHash,
      name: "Verde Marea Admin",
      role: "admin",
    },
  });

  const guestOne = await prisma.user.upsert({
    where: { email: "guest1@verdemarea.test" },
    update: {},
    create: {
      email: "guest1@verdemarea.test",
      passwordHash,
      name: "Гость Один",
      role: "user",
    },
  });

  const guestTwo = await prisma.user.upsert({
    where: { email: "guest2@verdemarea.test" },
    update: {},
    create: {
      email: "guest2@verdemarea.test",
      passwordHash,
      name: "Гость Два",
      role: "user",
    },
  });

  const tables = await Promise.all(
    [
      { name: "Стол 1", capacity: 2 },
      { name: "Стол 2", capacity: 2 },
      { name: "Стол 3", capacity: 4 },
      { name: "Стол 4", capacity: 4 },
      { name: "Стол 5", capacity: 6 },
      { name: "Стол 6", capacity: 8 },
    ].map((table) =>
      prisma.table.upsert({
        where: { name: table.name },
        update: {},
        create: table,
      }),
    ),
  );

  console.log("Seed complete:");
  console.log(`  super_admin: ${superAdmin.email} / ${SEED_PASSWORD}`);
  console.log(`  admin:       ${admin.email} / ${SEED_PASSWORD}`);
  console.log(`  user:        ${guestOne.email} / ${SEED_PASSWORD}`);
  console.log(`  user:        ${guestTwo.email} / ${SEED_PASSWORD}`);
  console.log(`  tables:      ${tables.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
