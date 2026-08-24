import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ------------------------------------
// ENUMS
// ------------------------------------
export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "car",
  "motorcycle",
  "suv",
  "van",
]);

export const priorityStatusEnum = pgEnum("priority_status", [
  "normal",
  "LOW_PRIORITIED",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "blocked",
]);

export const promoStatusEnum = pgEnum("promotion_status", [
  "ACTIVE",
  "INACTIVE",
  "EXPIRED",
]);

export const claimedPromoStatusEnum = pgEnum("claimed_promo_status", [
  "ACTIVE",
  "USED",
  "EXPIRED",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "earn",
  "spend",
  "expire",
]);

// ------------------------------------
// TABLES
// ------------------------------------

export const tierSets = pgTable("tier_sets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: text("status").default("Active").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const loyaltyTiers = pgTable(
  "loyalty_tiers",
  {
    id: text("id").primaryKey(), // e.g. "member", "silver", "gold", "platinum"
    name: text("name").notNull(),
    level: text("level"),
    pointThreshold: integer("point_threshold").default(0).notNull(),
    bookingWindowDays: integer("booking_window_days").default(7).notNull(),
    pointRate: doublePrecision("point_rate").default(1.0).notNull(),
    multiplier: text("multiplier"),
    discount: text("discount"),
    perks: text("perks").array().notNull(),
    description: text("description").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    tierSetId: text("tier_set_id").references(() => tierSets.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("loyalty_tiers_tier_set_id_idx").on(t.tierSetId)],
);

export const loyaltyCustomers = pgTable(
  "loyalty_customers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    phone: text("phone"),
    fullName: text("full_name"),
    username: text("username"),
    password: text("password"),
    email: text("email"),
    tierId: text("tier_id")
      .references(() => loyaltyTiers.id)
      .default("member")
      .notNull(),
    pointsBalance: integer("points_balance").default(0).notNull(), // redeemable points
    collectedPoints: integer("collected_points").default(0).notNull(), // lifetime collected points (for tier calculation)
    lateCancellationWarningCount: integer("late_cancellation_warnings")
      .default(0)
      .notNull(),
    priorityStatus: priorityStatusEnum("priority_status")
      .default("normal")
      .notNull(),
    status: text("status").default("Active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("loyalty_customers_tier_id_idx").on(t.tierId),
    index("loyalty_customers_phone_idx").on(t.phone),
  ],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .references(() => loyaltyCustomers.id, { onDelete: "cascade" })
      .notNull(),
    plate: text("plate").notNull(),
    model: text("model").notNull(),
    type: vehicleTypeEnum("type").default("car").notNull(),
    lastWashDate: timestamp("last_wash_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("vehicles_customer_id_idx").on(t.customerId),
    index("vehicles_plate_idx").on(t.plate),
  ],
);

export const serviceItems = pgTable("service_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(), // Exterior Wash, Interior Detailing, Full Package, Add-on
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  price: doublePrecision("price").notNull(),
  popularityCount: integer("popularity_count").default(0).notNull(),
  status: text("status").default("ACTIVE").notNull(),
  features: text("features").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const promotions = pgTable("promotions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  title: text("title"),
  description: text("description").notNull(),
  category: text("category"),
  promoType: text("promo_type").default("booking_discount"), // "bonus_points" | "booking_discount" | "service_discount" | "day_of_week_discount" | "dedicated_day_discount" | "tier_reward" | "new_member"
  bonusPoints: integer("bonus_points").default(0),
  discountPercentage: doublePrecision("discount_percentage"),
  discountAmount: doublePrecision("discount_amount"),
  applicableServiceIds: text("applicable_service_ids").array(),
  applicableDaysOfWeek: integer("applicable_days_of_week").array(), // 0=Sunday, 1=Monday, ..., 6=Saturday
  dedicatedDate: text("dedicated_date"), // YYYY-MM-DD
  pointPrice: integer("point_price"),
  applicableTiers: text("applicable_tiers").array().notNull(),
  applicableVehicleModels: text("applicable_vehicle_models").array().notNull(),
  badgeLabel: text("badge_label"),
  bannerImage: text("banner_image"),
  terms: text("terms"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: promoStatusEnum("status").default("ACTIVE").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const claimedPromos = pgTable(
  "claimed_promos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    promoId: text("promo_id")
      .references(() => promotions.id, { onDelete: "cascade" })
      .notNull(),
    customerId: text("customer_id")
      .references(() => loyaltyCustomers.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    description: text("description"),
    perkIdentifier: text("perk_identifier").notNull(),
    status: claimedPromoStatusEnum("status").default("ACTIVE").notNull(),
    claimedAt: timestamp("claimed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("claimed_promos_customer_id_idx").on(t.customerId),
    index("claimed_promos_promo_id_idx").on(t.promoId),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .references(() => loyaltyCustomers.id, { onDelete: "cascade" })
      .notNull(),
    vehiclePlate: text("vehicle_plate").notNull(),
    serviceId: text("service_id").references(() => serviceItems.id, {
      onDelete: "set null",
    }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    timeSlot: text("time_slot"),
    durationMinutes: integer("duration_minutes"),
    bayId: text("bay_id"),
    status: bookingStatusEnum("status").default("confirmed").notNull(),
    pointsEarned: integer("points_earned").default(0).notNull(),
    pointsSpent: integer("points_spent").default(0).notNull(),
    appliedPerks: text("applied_perks").array().notNull(),
    appliedPromoId: text("applied_promo_id"),
    isLateCancellation: boolean("is_late_cancellation")
      .default(false)
      .notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    note: text("note"),
    depositImageUrl: text("deposit_image_url"),
    depositSubmittedAt: timestamp("deposit_submitted_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("bookings_customer_id_idx").on(t.customerId),
    index("bookings_service_id_idx").on(t.serviceId),
    index("bookings_date_idx").on(t.date),
    index("bookings_status_idx").on(t.status),
  ],
);

export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .references(() => loyaltyCustomers.id, { onDelete: "cascade" })
      .notNull(),
    type: transactionTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("point_transactions_customer_id_idx").on(t.customerId),
    index("point_transactions_date_idx").on(t.date),
  ],
);

export const rewardOffers = pgTable("reward_offers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pointsRequired: integer("points_required").notNull(),
  eligibleTiers: text("eligible_tiers").array().notNull(),
  vehicleTypes: text("vehicle_types").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actor: text("actor").notNull(),
    actionType: text("action_type").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    details: text("details").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("audit_logs_timestamp_idx").on(t.timestamp),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  ],
);

// ------------------------------------
// RELATIONS
// ------------------------------------
export const tierSetsRelations = relations(tierSets, ({ many }) => ({
  tiers: many(loyaltyTiers),
}));

export const loyaltyTiersRelations = relations(
  loyaltyTiers,
  ({ one, many }) => ({
    tierSet: one(tierSets, {
      fields: [loyaltyTiers.tierSetId],
      references: [tierSets.id],
    }),
    customers: many(loyaltyCustomers),
  }),
);

export const loyaltyCustomersRelations = relations(
  loyaltyCustomers,
  ({ one, many }) => ({
    tier: one(loyaltyTiers, {
      fields: [loyaltyCustomers.tierId],
      references: [loyaltyTiers.id],
    }),
    vehicles: many(vehicles),
    bookings: many(bookings),
    pointHistory: many(pointTransactions),
    claimedPromos: many(claimedPromos),
  }),
);

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  customer: one(loyaltyCustomers, {
    fields: [vehicles.customerId],
    references: [loyaltyCustomers.id],
  }),
}));

export const serviceItemsRelations = relations(serviceItems, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(loyaltyCustomers, {
    fields: [bookings.customerId],
    references: [loyaltyCustomers.id],
  }),
  service: one(serviceItems, {
    fields: [bookings.serviceId],
    references: [serviceItems.id],
  }),
}));

export const promotionsRelations = relations(promotions, ({ many }) => ({
  claimedPromos: many(claimedPromos),
}));

export const claimedPromosRelations = relations(claimedPromos, ({ one }) => ({
  promotion: one(promotions, {
    fields: [claimedPromos.promoId],
    references: [promotions.id],
  }),
  customer: one(loyaltyCustomers, {
    fields: [claimedPromos.customerId],
    references: [loyaltyCustomers.id],
  }),
}));

export const pointTransactionsRelations = relations(
  pointTransactions,
  ({ one }) => ({
    customer: one(loyaltyCustomers, {
      fields: [pointTransactions.customerId],
      references: [loyaltyCustomers.id],
    }),
  }),
);
