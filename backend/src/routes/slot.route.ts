import {
  generateFallbackSlotsForDate,
  generateFallbackSlotsForDays,
  generateSlotsForDate,
  getSlotsForDays,
} from "../services/slot.service";

const SLOT_FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Slot request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function parseDays(daysParam: string | undefined): number {
  if (!daysParam) return 7;
  const parsed = Number.parseInt(daysParam, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 7;
  return Math.min(14, Math.max(1, parsed));
}

export function registerSlotRoutes(app: any) {
  app.get("/api/slots", async (ctx: any) => {
    const date = ctx.query?.date as string | undefined;
    const daysParam = ctx.query?.days as string | undefined;

    if (date) {
      try {
        const slots = await withTimeout(
          generateSlotsForDate(date),
          SLOT_FETCH_TIMEOUT_MS,
        );
        return {
          status: "success",
          count: slots.length,
          data: slots,
        };
      } catch (error) {
        console.error("[slots] Falling back to computed date slots:", error);
        const fallback = generateFallbackSlotsForDate(date);
        return {
          status: "success",
          degraded: true,
          count: fallback.length,
          data: fallback,
        };
      }
    }

    const days = parseDays(daysParam);
    try {
      const slots = await withTimeout(
        getSlotsForDays(days),
        SLOT_FETCH_TIMEOUT_MS,
      );
      return {
        status: "success",
        count: slots.length,
        data: slots,
      };
    } catch (error) {
      console.error("[slots] Falling back to computed day-range slots:", error);
      const fallback = generateFallbackSlotsForDays(days);
      return {
        status: "success",
        degraded: true,
        count: fallback.length,
        data: fallback,
      };
    }
  });

  app.get("/api/slots/available", async (ctx: any) => {
    const date = ctx.query?.date as string | undefined;
    const today = new Date().toISOString().split("T")[0];
    const targetDate = date || today;

    const slots = await generateSlotsForDate(targetDate);
    const availableSlots = slots.filter((s) => s.isAvailable);

    return {
      status: "success",
      date: targetDate,
      count: availableSlots.length,
      data: availableSlots,
    };
  });

  return app;
}
