import type { AuditLog } from "../models/loyalty.model";
import { db, schema } from "../db/index";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db.select().from(schema.auditLogs);
  return rows
    .map((r) => ({
      id: r.id,
      timestamp: r.timestamp.toISOString(),
      actor: r.actor,
      actionType: r.actionType,
      entityType: r.entityType,
      entityId: r.entityId,
      details: r.details,
    }))
    .reverse();
}

export async function logAudit(
  log: Omit<AuditLog, "id" | "timestamp">,
): Promise<AuditLog> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const record: AuditLog = {
    id: createId(),
    timestamp: new Date().toISOString(),
    ...log,
  };

  await db.insert(schema.auditLogs).values({
    id: record.id,
    actor: record.actor,
    actionType: record.actionType,
    entityType: record.entityType,
    entityId: record.entityId,
    details: record.details,
  });

  return record;
}
