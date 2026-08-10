import type { AuditLog, LoyaltyStore } from "../models/loyalty.model";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
