import type {
  AdminDashboardData,
  BayStatus,
  DashboardMetrics,
  RecentActivity,
  WeeklyBookingStat,
} from "../models/loyalty.model";
import { fetchAllServices } from "./service.service";
import { db, schema } from "../db/index";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const bookingRows = await db.select().from(schema.bookings);
  const customerRows = await db.select().from(schema.loyaltyCustomers);
  const customerMap = new Map(customerRows.map((c) => [c.id, c]));

  const allBookings = bookingRows.map((b) => {
    const customer = customerMap.get(b.customerId);
    return {
      id: b.id,
      date: b.date.toISOString().split("T")[0],
      status: b.status,
      serviceId: b.serviceId || undefined,
      service: undefined as string | undefined,
      serviceName: undefined as string | undefined,
      vehiclePlate: b.vehiclePlate,
      vehicleModel: undefined as string | undefined,
      timeSlot: b.timeSlot || undefined,
      time: b.timeSlot || undefined,
      createdAt: b.createdAt.toISOString(),
      customerName:
        customer?.fullName ||
        customer?.username ||
        `Customer (${customer?.phone})`,
      customerPhone: customer?.phone,
      customerTier: customer?.tierId,
    };
  });

  const services = await fetchAllServices();
  const servicePriceMap = new Map<string, number>();
  services.forEach((s) => {
    servicePriceMap.set(s.id, s.price);
    servicePriceMap.set(s.name, s.price);
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = allBookings.filter(
    (b) => b.date === todayStr || b.date?.startsWith(todayStr),
  );

  // Calculate revenue today
  let revenueNum = 0;
  todayBookings.forEach((b) => {
    if (b.status === "confirmed" || b.status === "completed") {
      const price =
        (b.serviceId && servicePriceMap.get(b.serviceId)) ||
        (b.service && servicePriceMap.get(b.service)) ||
        25.0;
      revenueNum += price;
    }
  });

  // 4 bays in total, open 9:00 AM to 5:00 PM with 30-min slots:
  // Slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00 (17 slots)
  // Total capacity per day = 4 bays * 17 time slots = 68 booking slots
  const TOTAL_BAYS = 4;
  const SLOTS_PER_BAY = 17;
  const TOTAL_DAILY_SLOTS = TOTAL_BAYS * SLOTS_PER_BAY;

  // Active bookings today (confirmed / pending today)
  const todayActiveBookings = todayBookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending",
  );
  const activeBookingsCount = todayActiveBookings.length;

  // Available slots today: total daily capacity minus today's active/confirmed/completed bookings
  const todayBookedSlotsCount = todayBookings.filter(
    (b) =>
      b.status === "confirmed" ||
      b.status === "pending" ||
      b.status === "completed",
  ).length;
  const availableSlotsCount = Math.max(
    0,
    TOTAL_DAILY_SLOTS - todayBookedSlotsCount,
  );

  // Distinct bays occupied today / currently active
  const occupiedBaysCount = Math.min(todayActiveBookings.length, TOTAL_BAYS);

  const bayOccupancyRate = Math.round((occupiedBaysCount / TOTAL_BAYS) * 100);

  const metrics: DashboardMetrics = {
    totalRevenueToday: `$${revenueNum.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    activeBookings: activeBookingsCount,
    availableSlots: availableSlotsCount,
    bayOccupancy: `${occupiedBaysCount}/${TOTAL_BAYS}`,
    bayOccupancyRate,
  };

  // Weekly bookings (last 7 days)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyBookings: WeeklyBookingStat[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const dayName = daysOfWeek[d.getDay()];

    const dayBookings = allBookings.filter(
      (b) => b.date === dStr || b.date?.startsWith(dStr),
    );
    const count = dayBookings.length;

    let dayRevenue = 0;
    dayBookings.forEach((b) => {
      if (b.status === "confirmed" || b.status === "completed") {
        const price =
          (b.serviceId && servicePriceMap.get(b.serviceId)) ||
          (b.service && servicePriceMap.get(b.service)) ||
          25.0;
        dayRevenue += price;
      }
    });

    weeklyBookings.push({
      day: dayName,
      count,
      revenue: dayRevenue,
    });
  }

  // Bay status (4 bays)
  const bayStatus: BayStatus[] = [
    {
      bay: "Bay 1",
      type: "Express Touchless",
      status: "active",
      eta: "Available",
    },
    {
      bay: "Bay 2",
      type: "Full Detail & Steam",
      status: "active",
      eta: "Available",
    },
    {
      bay: "Bay 3",
      type: "Self-Serve Jet Foam",
      status: "active",
      eta: "Available",
    },
    {
      bay: "Bay 4",
      type: "Ceramic Sealant Bay",
      status: "active",
      eta: "Available",
    },
  ];

  // Recent activity
  const sortedBookings = allBookings
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.date).getTime() -
        new Date(a.createdAt || a.date).getTime(),
    )
    .slice(0, 10);

  const recentActivity: RecentActivity[] = sortedBookings.map((b) => ({
    id: b.id,
    name: b.customerName || "Customer",
    phone: b.customerPhone || "N/A",
    vehicle: `${b.vehiclePlate} ${b.vehicleModel || ""}`.trim(),
    service: b.serviceName || b.service || "Exterior Wash",
    time: b.timeSlot || b.time || "Scheduled",
    status:
      b.status === "confirmed"
        ? "In Progress"
        : b.status === "completed"
          ? "Completed"
          : "Cancelled",
    timestamp: b.createdAt,
  }));

  return {
    metrics,
    weeklyBookings,
    bayStatus,
    recentActivity,
  };
}
