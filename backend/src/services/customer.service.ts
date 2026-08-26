import type { LoyaltyCustomer } from "../models/customer.model";
import type { PointTransaction } from "../models/point.model";
import type { ServiceItem } from "../models/service.model";
import type { Vehicle } from "../models/vehicle.model";
import { db, schema } from "../db/index";
import { sql, eq, or } from "drizzle-orm";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function loadCustomerDetails(
  dbC: typeof schema.loyaltyCustomers.$inferSelect,
): Promise<LoyaltyCustomer> {
  const [vehicleRows, txRows, bookingRows, claimedRows, serviceRows] =
    await Promise.all([
      db!
        .select()
        .from(schema.vehicles)
        .where(eq(schema.vehicles.customerId, dbC.id)),
      db!
        .select()
        .from(schema.pointTransactions)
        .where(eq(schema.pointTransactions.customerId, dbC.id)),
      db!
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.customerId, dbC.id)),
      db!
        .select({
          id: schema.claimedPromos.id,
          promoId: schema.claimedPromos.promoId,
          customerId: schema.claimedPromos.customerId,
          title: schema.claimedPromos.title,
          description: schema.claimedPromos.description,
          perkIdentifier: schema.claimedPromos.perkIdentifier,
          status: schema.claimedPromos.status,
          claimedAt: schema.claimedPromos.claimedAt,
          validUntil: schema.claimedPromos.validUntil,
          promoType: schema.promotions.promoType,
          discountPercentage: schema.promotions.discountPercentage,
          discountAmount: schema.promotions.discountAmount,
          bonusPoints: schema.promotions.bonusPoints,
          applicableServiceIds: schema.promotions.applicableServiceIds,
        })
        .from(schema.claimedPromos)
        .leftJoin(
          schema.promotions,
          eq(schema.claimedPromos.promoId, schema.promotions.id),
        )
        .where(eq(schema.claimedPromos.customerId, dbC.id)),
      db!.select().from(schema.serviceItems),
    ]);

  const vehicles: Vehicle[] = vehicleRows.map((v) => ({
    plate: v.plate,
    model: v.model,
    type: v.type,
    lastWashDate: v.lastWashDate?.toISOString(),
  }));

  const vehicleMap = new Map(
    vehicleRows.map((v) => [v.plate.toUpperCase(), v]),
  );
  const serviceMap = new Map<string, any>();
  serviceRows.forEach((s) => {
    serviceMap.set(s.id, s);
    serviceMap.set(s.id.toLowerCase(), s);
    if (s.name) serviceMap.set(s.name.toLowerCase(), s);
  });

  const pointHistory: PointTransaction[] = txRows.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date.toISOString(),
    description: t.description,
  }));

  const bookingHistory = bookingRows.map((b) => {
    const srv = b.serviceId ? serviceMap.get(b.serviceId) : undefined;
    const veh = vehicleMap.get(b.vehiclePlate.toUpperCase());
    const pts = b.pointsEarned || b.pointsSpent || undefined;

    // Resolve service names if multiple serviceIds or serviceName is present
    let resolvedServiceName = b.serviceName;
    if (!resolvedServiceName && b.serviceIds && b.serviceIds.length > 0) {
      resolvedServiceName = b.serviceIds
        .map((id) => serviceMap.get(id)?.name)
        .filter(Boolean)
        .join(", ");
    }
    if (!resolvedServiceName && srv?.name) {
      resolvedServiceName = srv.name;
    }

    return {
      id: b.id,
      customerId: b.customerId,
      vehiclePlate: b.vehiclePlate,
      vehicleModel: veh?.model || undefined,
      vehicleType: veh?.type || undefined,
      serviceId: b.serviceId || undefined,
      serviceIds:
        b.serviceIds && b.serviceIds.length > 0
          ? b.serviceIds
          : b.serviceId
            ? [b.serviceId]
            : undefined,
      serviceName: resolvedServiceName || undefined,
      service: resolvedServiceName || undefined,
      bookingPrice: b.bookingPrice ?? undefined,
      date: b.date.toISOString().split("T")[0],
      time: b.timeSlot || undefined,
      timeSlot: b.timeSlot || undefined,
      durationMinutes: b.durationMinutes || srv?.durationMinutes || undefined,
      bayId: b.bayId || undefined,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      appliedPerks: b.appliedPerks || [],
      appliedPromoId: b.appliedPromoId || undefined,
      points: pts,
      pointsEarned: b.pointsEarned,
      pointsSpent: b.pointsSpent,
      status: b.status,
      cancelledAt: b.cancelledAt?.toISOString(),
      isLateCancellation: b.isLateCancellation,
      note: b.note || undefined,
      depositImageUrl: b.depositImageUrl || undefined,
      depositSubmittedAt: b.depositSubmittedAt?.toISOString(),
    };
  });

  return {
    id: dbC.id,
    phone: dbC.phone || "",
    username: dbC.username || undefined,
    password: dbC.password || undefined,
    fullName: dbC.fullName || undefined,
    email: dbC.email || undefined,
    licensePlates: vehicles.map((v) => v.plate),
    tierId: dbC.tierId,
    pointsBalance: dbC.pointsBalance,
    collectedPoints: dbC.collectedPoints,
    vehicles,
    pointHistory,
    bookingHistory,
    claimedPromos: claimedRows.map((c) => ({
      id: c.id,
      promoId: c.promoId,
      customerId: c.customerId,
      title: c.title,
      description: c.description || undefined,
      claimedAt: c.claimedAt.toISOString(),
      validUntil: c.validUntil.toISOString().split("T")[0],
      status: c.status,
      perkIdentifier: c.perkIdentifier,
      promoType: (c.promoType as any) || undefined,
      discountPercentage: c.discountPercentage ?? undefined,
      discountAmount: c.discountAmount ?? undefined,
      bonusPoints: c.bonusPoints ?? undefined,
      applicableServiceIds: c.applicableServiceIds ?? undefined,
    })),
    lateCancellationWarningCount: dbC.lateCancellationWarningCount,
    priorityStatus: dbC.priorityStatus,
    status: dbC.status as any,
    blockedUntil: dbC.blockedUntil ? dbC.blockedUntil.toISOString() : null,
    createdAt: dbC.createdAt.toISOString(),
    updatedAt: dbC.updatedAt.toISOString(),
  };
}

export async function findCustomerRecord(
  phoneOrUsernameOrEmail?: string,
  plate?: string,
): Promise<LoyaltyCustomer | undefined> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  if (plate) {
    const vehicleRows = await db
      .select()
      .from(schema.vehicles)
      .where(sql`upper(${schema.vehicles.plate}) = ${plate.toUpperCase()}`)
      .limit(1);
    if (vehicleRows.length > 0) {
      const rows = await db
        .select()
        .from(schema.loyaltyCustomers)
        .where(eq(schema.loyaltyCustomers.id, vehicleRows[0].customerId))
        .limit(1);
      if (rows.length > 0) return loadCustomerDetails(rows[0]);
    }
  }

  if (phoneOrUsernameOrEmail) {
    const value = phoneOrUsernameOrEmail.trim();
    const valueLower = value.toLowerCase();
    const rows = await db
      .select()
      .from(schema.loyaltyCustomers)
      .where(
        or(
          eq(schema.loyaltyCustomers.id, value),
          eq(schema.loyaltyCustomers.phone, value),
          sql`lower(${schema.loyaltyCustomers.username}) = ${valueLower}`,
          sql`lower(${schema.loyaltyCustomers.email}) = ${valueLower}`,
        ),
      )
      .limit(1);
    if (rows.length > 0) return loadCustomerDetails(rows[0]);
  }

  return undefined;
}

export async function fetchAllCustomers(options?: {
  query?: string;
  tier?: string;
  status?: string;
}): Promise<LoyaltyCustomer[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const dbCustomers = await db.select().from(schema.loyaltyCustomers);
  let list = await Promise.all(dbCustomers.map((c) => loadCustomerDetails(c)));

  if (options?.query) {
    const q = options.query.toLowerCase().trim();
    list = list.filter((c) => {
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchName =
        c.fullName?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPlates = c.licensePlates?.some((p) =>
        p.toLowerCase().includes(q),
      );
      return matchPhone || matchName || matchEmail || matchPlates;
    });
  }

  if (options?.tier && options.tier !== "ALL") {
    const t = options.tier.toLowerCase();
    list = list.filter((c) => c.tierId.toLowerCase() === t);
  }

  if (options?.status && options.status !== "ALL") {
    const s = options.status.toLowerCase();
    list = list.filter((c) => {
      if (s === "low priority") return c.priorityStatus === "LOW_PRIORITIED";
      if (s === "active") return c.status !== "Inactive";
      return c.status?.toLowerCase() === s;
    });
  }

  return list;
}

export async function fetchCustomerById(
  id: string,
): Promise<LoyaltyCustomer | undefined> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.loyaltyCustomers)
    .where(eq(schema.loyaltyCustomers.id, id))
    .limit(1);

  if (rows.length === 0) return undefined;
  return loadCustomerDetails(rows[0]);
}

export async function createCustomerItem(data: {
  phone: string;
  fullName?: string;
  email?: string;
  tierId?: string;
  pointsBalance?: number;
  collectedPoints?: number;
  initialVehicle?: {
    plate: string;
    model: string;
    type: "car" | "motorcycle" | "suv" | "van";
  };
}): Promise<LoyaltyCustomer> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await findCustomerRecord(data.phone);
  if (existing) {
    throw new Error(`Customer with phone ${data.phone} already exists.`);
  }

  const now = new Date().toISOString();
  const id = createId();
  const initialPoints = data.pointsBalance || 0;
  const initialCollected =
    data.collectedPoints !== undefined ? data.collectedPoints : initialPoints;

  await db.insert(schema.loyaltyCustomers).values({
    id,
    phone: data.phone.trim(),
    email: data.email?.trim() || null,
    fullName: data.fullName?.trim() || null,
    tierId: data.tierId || "member",
    pointsBalance: initialPoints,
    collectedPoints: initialCollected,
  });

  if (data.initialVehicle) {
    const plateUpper = data.initialVehicle.plate.trim().toUpperCase();
    await db.insert(schema.vehicles).values({
      id: createId(),
      customerId: id,
      plate: plateUpper,
      model: data.initialVehicle.model.trim() || "Not provided",
      type: data.initialVehicle.type || "car",
    });
  }

  if (initialPoints) {
    await db.insert(schema.pointTransactions).values({
      id: createId(),
      customerId: id,
      type: "earn",
      amount: initialPoints,
      description: "Initial account points balance",
    });
  }

  return (await fetchCustomerById(id))!;
}

export async function updateCustomerItem(
  id: string,
  data: Partial<LoyaltyCustomer>,
): Promise<LoyaltyCustomer | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await fetchCustomerById(id);
  if (!existing) return null;

  await db
    .update(schema.loyaltyCustomers)
    .set({
      phone: data.phone ?? existing.phone,
      username: data.username ?? existing.username ?? null,
      email: data.email ?? existing.email ?? null,
      fullName: data.fullName ?? existing.fullName ?? null,
      tierId: data.tierId ?? existing.tierId,
      pointsBalance: data.pointsBalance ?? existing.pointsBalance,
      collectedPoints: data.collectedPoints ?? existing.collectedPoints,
      priorityStatus: data.priorityStatus ?? existing.priorityStatus,
      status: data.status ?? existing.status,
      blockedUntil:
        data.blockedUntil !== undefined
          ? data.blockedUntil
            ? new Date(data.blockedUntil)
            : null
          : existing.blockedUntil
            ? new Date(existing.blockedUntil)
            : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.loyaltyCustomers.id, id));

  return fetchCustomerById(id) as Promise<LoyaltyCustomer>;
}

export async function adjustCustomerPointsItem(
  id: string,
  delta: number,
  reason: string,
  options?: { affectsCollectedPoints?: boolean },
): Promise<{
  customer: LoyaltyCustomer;
  transaction: PointTransaction;
} | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await fetchCustomerById(id);
  if (!existing) return null;

  const now = new Date();
  const newBalance = Math.max(0, existing.pointsBalance + delta);
  const newCollected =
    delta > 0 && options?.affectsCollectedPoints !== false
      ? (existing.collectedPoints ?? 0) + delta
      : existing.collectedPoints;

  await db
    .update(schema.loyaltyCustomers)
    .set({
      pointsBalance: newBalance,
      collectedPoints: newCollected,
      updatedAt: now,
    })
    .where(eq(schema.loyaltyCustomers.id, id));

  const transaction: PointTransaction = {
    id: createId(),
    type: delta >= 0 ? "earn" : "spend",
    amount: Math.abs(delta),
    date: now.toISOString(),
    description:
      reason || `Manual adjustment (${delta > 0 ? "+" : ""}${delta} pts)`,
  };

  await db.insert(schema.pointTransactions).values({
    id: transaction.id,
    customerId: id,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
  });

  const customer = (await fetchCustomerById(id))!;
  return { customer, transaction };
}

export async function resetCustomerWarningsItem(
  id: string,
): Promise<LoyaltyCustomer | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await fetchCustomerById(id);
  if (!existing) return null;

  await db
    .update(schema.loyaltyCustomers)
    .set({
      lateCancellationWarningCount: 0,
      priorityStatus: "normal",
      status:
        existing.status === "Blocked" || existing.status === "Low Priority"
          ? "Active"
          : existing.status,
      blockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.loyaltyCustomers.id, id));

  return fetchCustomerById(id) as Promise<LoyaltyCustomer>;
}
