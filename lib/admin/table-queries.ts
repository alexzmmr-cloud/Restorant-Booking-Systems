import { prisma } from "@/lib/prisma";

export async function listAllTables() {
  return prisma.table.findMany({ orderBy: { capacity: "asc" } });
}
