import {
  generateSlotsForDate,
  getSlotsForDays,
} from "../services/slot.service";

export function registerSlotRoutes(app: any) {
  app.get("/api/slots", async (ctx: any) => {
    const date = ctx.query?.date as string | undefined;
    const daysParam = ctx.query?.days as string | undefined;

    if (date) {
      const slots = await generateSlotsForDate(date);
      return {
        status: "success",
        count: slots.length,
        data: slots,
      };
    }

    const days = daysParam ? parseInt(daysParam, 10) : 7;
    const slots = await getSlotsForDays(days);
    return {
      status: "success",
      count: slots.length,
      data: slots,
    };
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
