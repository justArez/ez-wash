import type { AuditLog, LoyaltyStore } from "../models/loyalty.model";
import { db, schema } from "../db/index";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function fetchAuditLogs(store: LoyaltyStore): Promise<AuditLog[]> {
  if (db) {
    try {
      const rows = await db.select().from(schema.auditLogs);
      if (rows && rows.length > 0) {
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
    } catch (err) {
      console.warn("Could not load audit logs from Postgres DB:", err);
    }
  }

  return (store.auditLogs || []).slice().reverse();
}

export function logAudit(
  store: LoyaltyStore,
  log: Omit<AuditLog, "id" | "timestamp">,
) {
  const record: AuditLog = {
    id: createId(),
    timestamp: new Date().toISOString(),
    ...log,
  };
  store.auditLogs.push(record);
  return record;
}
