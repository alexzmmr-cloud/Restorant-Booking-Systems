"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { createTableSchema, updateTableSchema } from "@/lib/validation/table";

export type TableActionResult =
  | { success: true }
  | { success: false; error: string };

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

export async function createTableAction(input: unknown): Promise<TableActionResult> {
  const actor = await requireRole(["admin", "super_admin"]);

  const parsed = createTableSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  try {
    const table = await prisma.table.create({ data: parsed.data });
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "table.created",
        targetType: "Table",
        targetId: table.id,
        metadata: { name: table.name, capacity: table.capacity },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return { success: false, error: "Стол с таким названием уже существует" };
    }
    throw error;
  }

  return { success: true };
}

export async function updateTableAction(input: unknown): Promise<TableActionResult> {
  const actor = await requireRole(["admin", "super_admin"]);

  const parsed = updateTableSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { id, name, capacity } = parsed.data;

  try {
    await prisma.table.update({ where: { id }, data: { name, capacity } });
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "table.updated",
        targetType: "Table",
        targetId: id,
        metadata: { name, capacity },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      return { success: false, error: "Стол с таким названием уже существует" };
    }
    throw error;
  }

  return { success: true };
}

export async function toggleTableActiveAction(
  tableId: string,
  isActive: boolean,
): Promise<TableActionResult> {
  const actor = await requireRole(["admin", "super_admin"]);

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table) {
    return { success: false, error: "Стол не найден" };
  }

  await prisma.table.update({ where: { id: tableId }, data: { isActive } });
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: isActive ? "table.activated" : "table.deactivated",
      targetType: "Table",
      targetId: tableId,
      metadata: { name: table.name },
    },
  });

  return { success: true };
}
