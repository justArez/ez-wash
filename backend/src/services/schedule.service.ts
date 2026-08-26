import { db, schema } from "../db/index";
import { eq, and, sql, desc } from "drizzle-orm";
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

export async function fetchScheduleBlocks(options?: {
  date?: string;
  type?: string;
  bayId?: string;
}): Promise<ScheduleBlock[]> {
  try {
    const rows = await db
      .select()
      .from(schema.scheduleBlocks)
      .orderBy(desc(schema.scheduleBlocks.createdAt));

    let list: ScheduleBlock[] = rows.map((r) => ({
      id: r.id,
      type: r.type as ScheduleBlock["type"],
      title: r.title,
      reason: r.reason || undefined,
      startDate: r.startDate,
      endDate: r.endDate,
      startTime: r.startTime || undefined,
      endTime: r.endTime || undefined,
      bayId: r.bayId || "all",
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

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
  } catch (error) {
    console.error("Failed to fetch schedule blocks from db:", error);
    return [];
  }
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
  const newId = `BLK-${Date.now().toString(36).toUpperCase()}`;
  const startDate = data.startDate;
  const endDate = data.endDate || data.startDate;

  const [inserted] = await db
    .insert(schema.scheduleBlocks)
    .values({
      id: newId,
      type: data.type,
      title: data.title.trim(),
      reason: data.reason?.trim() || null,
      startDate,
      endDate,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      bayId: data.bayId || "all",
      isActive: true,
    })
    .returning();

  const block: ScheduleBlock = {
    id: inserted.id,
    type: inserted.type as ScheduleBlock["type"],
    title: inserted.title,
    reason: inserted.reason || undefined,
    startDate: inserted.startDate,
    endDate: inserted.endDate,
    startTime: inserted.startTime || undefined,
    endTime: inserted.endTime || undefined,
    bayId: inserted.bayId || "all",
    isActive: inserted.isActive,
    createdAt: inserted.createdAt.toISOString(),
    updatedAt: inserted.updatedAt.toISOString(),
  };

  await logAudit({
    actor: "admin",
    actionType: "create-schedule-block",
    entityType: "schedule_block",
    entityId: block.id,
    details: `Created ${block.type}: "${block.title}" for ${block.startDate} (Bay: ${block.bayId})`,
  });

  return block;
}

export async function updateScheduleBlock(
  id: string,
  data: Partial<Omit<ScheduleBlock, "id" | "createdAt" | "updatedAt">>,
): Promise<ScheduleBlock | null> {
  const updatePayload: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.reason !== undefined) updatePayload.reason = data.reason?.trim() || null;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate;
  if (data.endDate !== undefined) updatePayload.endDate = data.endDate;
  if (data.startTime !== undefined) updatePayload.startTime = data.startTime || null;
  if (data.endTime !== undefined) updatePayload.endTime = data.endTime || null;
  if (data.bayId !== undefined) updatePayload.bayId = data.bayId || "all";
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

  const [updated] = await db
    .update(schema.scheduleBlocks)
    .set(updatePayload)
    .where(eq(schema.scheduleBlocks.id, id))
    .returning();

  if (!updated) return null;

  const block: ScheduleBlock = {
    id: updated.id,
    type: updated.type as ScheduleBlock["type"],
    title: updated.title,
    reason: updated.reason || undefined,
    startDate: updated.startDate,
    endDate: updated.endDate,
    startTime: updated.startTime || undefined,
    endTime: updated.endTime || undefined,
    bayId: updated.bayId || "all",
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };

  await logAudit({
    actor: "admin",
    actionType: "update-schedule-block",
    entityType: "schedule_block",
    entityId: id,
    details: `Updated schedule block "${block.title}"`,
  });

  return block;
}

export async function deleteScheduleBlock(id: string): Promise<boolean> {
  const [deleted] = await db
    .delete(schema.scheduleBlocks)
    .where(eq(schema.scheduleBlocks.id, id))
    .returning();

  if (!deleted) return false;

  await logAudit({
    actor: "admin",
    actionType: "delete-schedule-block",
    entityType: "schedule_block",
    entityId: id,
    details: `Deleted schedule block "${deleted.title}" (${id})`,
  });

  return true;
}
