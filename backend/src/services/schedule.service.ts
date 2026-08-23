import { db, schema } from "../db/index";
import { eq, and, sql } from "drizzle-orm";
import { logAudit } from "./audit.service";

export interface ScheduleBlock {
  id: string;
  type: "maintenance" | "day_off" | "holiday" | "custom_block";
  title: string;
  reason?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM or null (full day if empty)
  endTime?: string; // HH:MM or null (full day if empty)
  bayId?: string; // 'all', '1', '2', '3', '4'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent fallback store if table doesn't exist yet in db
let inMemoryBlocks: ScheduleBlock[] = [
  {
    id: "BLK-001",
    type: "maintenance",
    title: "Bay 3 Jet Pump Servicing",
    reason:
      "Routine quarterly high-pressure nozzle and pump filter replacement.",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "13:00",
    endTime: "15:00",
    bayId: "3",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchScheduleBlocks(options?: {
  date?: string;
  type?: string;
  bayId?: string;
}): Promise<ScheduleBlock[]> {
  let list = [...inMemoryBlocks];

  if (options?.type && options.type !== "ALL" && options.type !== "All") {
    list = list.filter((b) => b.type === options.type);
  }

  if (options?.bayId && options.bayId !== "ALL" && options.bayId !== "All") {
    list = list.filter((b) => b.bayId === options.bayId || b.bayId === "all");
  }

  if (options?.date) {
    list = list.filter(
      (b) => b.startDate <= options.date! && b.endDate >= options.date!,
    );
  }

  return list;
}

export async function createScheduleBlock(data: {
  type: "maintenance" | "day_off" | "holiday" | "custom_block";
  title: string;
  reason?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  bayId?: string;
}): Promise<ScheduleBlock> {
  const newBlock: ScheduleBlock = {
    id: `BLK-${Date.now().toString(36).toUpperCase()}`,
    type: data.type,
    title: data.title.trim(),
    reason: data.reason?.trim() || undefined,
    startDate: data.startDate,
    endDate: data.endDate || data.startDate,
    startTime: data.startTime || undefined,
    endTime: data.endTime || undefined,
    bayId: data.bayId || "all",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryBlocks.unshift(newBlock);

  await logAudit({
    actor: "admin",
    actionType: "create-schedule-block",
    entityType: "schedule_block",
    entityId: newBlock.id,
    details: `Created ${newBlock.type}: "${newBlock.title}" for ${newBlock.startDate} (Bay: ${newBlock.bayId})`,
  });

  return newBlock;
}

export async function updateScheduleBlock(
  id: string,
  data: Partial<Omit<ScheduleBlock, "id" | "createdAt" | "updatedAt">>,
): Promise<ScheduleBlock | null> {
  const index = inMemoryBlocks.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = inMemoryBlocks[index];
  const updated: ScheduleBlock = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  inMemoryBlocks[index] = updated;

  await logAudit({
    actor: "admin",
    actionType: "update-schedule-block",
    entityType: "schedule_block",
    entityId: id,
    details: `Updated schedule block "${updated.title}"`,
  });

  return updated;
}

export async function deleteScheduleBlock(id: string): Promise<boolean> {
  const index = inMemoryBlocks.findIndex((b) => b.id === id);
  if (index === -1) return false;

  const deleted = inMemoryBlocks.splice(index, 1)[0];

  await logAudit({
    actor: "admin",
    actionType: "delete-schedule-block",
    entityType: "schedule_block",
    entityId: id,
    details: `Deleted schedule block "${deleted.title}" (${id})`,
  });

  return true;
}
