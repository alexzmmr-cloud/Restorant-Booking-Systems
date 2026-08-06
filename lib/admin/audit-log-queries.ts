import { prisma } from "@/lib/prisma";

export async function listRecentAuditLog(limit = 50) {
  return prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
