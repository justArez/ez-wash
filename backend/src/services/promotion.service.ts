import type { ClaimedPromo, Promotion } from "../models/promo.model";
import type { PointTransaction } from "../models/point.model";
import { db, schema } from "../db/index";
import { sql, and, eq } from "drizzle-orm";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const TIER_ORDER: Record<string, number> = {
  member: 0,
  Member: 0,
  MEMBER: 0,
  silver: 1,
  Silver: 1,
  SILVER: 1,
  gold: 2,
  Gold: 2,
  GOLD: 2,
  platinum: 3,
  Platinum: 3,
  PLATINUM: 3,
};

function mapPromotionRow(r: typeof schema.promotions.$inferSelect): Promotion {
  return {
    id: r.id,
    name: r.name,
    title: r.title || r.name,
    promoName: r.name,
    description: r.description,
    category: (r.category as any) || "discount",
    promoType: (r.promoType as any) || "booking_discount",
    bonusPoints: r.bonusPoints || 0,
    discountPercentage: r.discountPercentage || 0,
    discountAmount: r.discountAmount || 0,
    applicableServiceIds: r.applicableServiceIds || [],
    applicableDaysOfWeek: r.applicableDaysOfWeek || [],
    dedicatedDate: r.dedicatedDate || undefined,
    pointPrice: r.pointPrice || 0,
    loyaltyPointsRequired: r.pointPrice || 0,
    loyaltyPointsValue: r.bonusPoints || 100,
    applicableTiers: r.applicableTiers || [],
    applicableVehicleModels: r.applicableVehicleModels || [],
    badgeLabel: r.badgeLabel || undefined,
    bannerImage: r.bannerImage || undefined,
    terms: r.terms || undefined,
    isInfiniteUse: r.isInfiniteUse ?? false,
    isInifiteUse: r.isInfiniteUse ?? false,
    startDate: r.startDate.toISOString().split("T")[0],
    endDate: r.endDate.toISOString().split("T")[0],
    validUntil: r.endDate.toISOString().split("T")[0],
    validRange: `${r.startDate.toISOString().split("T")[0]} - ${r.endDate.toISOString().split("T")[0]}`,
    status: r.status as any,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function fetchAllPromotions(
  onlyActive = false,
): Promise<Promotion[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db.select().from(schema.promotions);
  let promos = rows.map(mapPromotionRow);

  if (onlyActive) {
    promos = promos.filter(
      (p) => p.isActive !== false && p.status !== "INACTIVE",
    );
  }

  return promos;
}

export async function fetchPromotionById(
  id: string,
): Promise<Promotion | undefined> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.promotions)
    .where(sql`${schema.promotions.id} = ${id}`)
    .limit(1);

  if (!rows || rows.length === 0) {
    return undefined;
  }

  return mapPromotionRow(rows[0]);
}

export async function createPromotionItem(
  data: Partial<Promotion>,
): Promise<Promotion> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const now = new Date().toISOString();
  const promotion: Promotion = {
    id:
      data.id?.trim() ||
      `promo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name?.trim() || data.title?.trim() || "New Promotion",
    title: data.title?.trim() || data.name?.trim() || "New Promotion",
    description: data.description?.trim() || "",
    category: data.category || "discount",
    promoType: data.promoType || "booking_discount",
    bonusPoints: data.bonusPoints ?? 0,
    discountPercentage: data.discountPercentage ?? 0,
    discountAmount: data.discountAmount ?? 0,
    applicableServiceIds: data.applicableServiceIds ?? [],
    applicableDaysOfWeek: data.applicableDaysOfWeek ?? [],
    dedicatedDate: data.dedicatedDate,
    pointPrice: data.pointPrice ?? 0,
    applicableTiers: data.applicableTiers ?? [],
    applicableVehicleModels: data.applicableVehicleModels ?? [],
    badgeLabel: data.badgeLabel,
    bannerImage: data.bannerImage,
    terms: data.terms,
    isInfiniteUse: data.isInfiniteUse ?? data.isInifiteUse ?? false,
    isInifiteUse: data.isInfiniteUse ?? data.isInifiteUse ?? false,
    startDate: data.startDate ?? now.slice(0, 10),
    endDate: data.endDate ?? now.slice(0, 10),
    status: data.status || "ACTIVE",
    isActive: data.isActive ?? true,
  };

  await db
    .insert(schema.promotions)
    .values({
      id: promotion.id,
      name: promotion.name,
      title: promotion.title || promotion.name,
      description: promotion.description,
      category: promotion.category,
      promoType: promotion.promoType,
      bonusPoints: promotion.bonusPoints ?? 0,
      discountPercentage: promotion.discountPercentage,
      discountAmount: promotion.discountAmount,
      applicableServiceIds: promotion.applicableServiceIds,
      applicableDaysOfWeek: promotion.applicableDaysOfWeek,
      dedicatedDate: promotion.dedicatedDate,
      pointPrice: promotion.pointPrice as number,
      applicableTiers: promotion.applicableTiers || [],
      applicableVehicleModels: promotion.applicableVehicleModels || [],
      badgeLabel: promotion.badgeLabel,
      bannerImage: promotion.bannerImage,
      terms: promotion.terms,
      isInfiniteUse: promotion.isInfiniteUse ?? false,
      startDate: new Date(promotion.startDate),
      endDate: new Date(promotion.endDate),
      status: (promotion.status as any) || "ACTIVE",
      isActive: promotion.isActive !== false,
    })
    .onConflictDoUpdate({
      target: schema.promotions.id,
      set: {
        name: promotion.name,
        title: promotion.title || promotion.name,
        description: promotion.description,
        category: promotion.category,
        promoType: promotion.promoType,
        bonusPoints: promotion.bonusPoints ?? 0,
        discountPercentage: promotion.discountPercentage,
        discountAmount: promotion.discountAmount,
        applicableServiceIds: promotion.applicableServiceIds,
        applicableDaysOfWeek: promotion.applicableDaysOfWeek,
        dedicatedDate: promotion.dedicatedDate,
        pointPrice: promotion.pointPrice as number,
        applicableTiers: promotion.applicableTiers || [],
        applicableVehicleModels: promotion.applicableVehicleModels || [],
        badgeLabel: promotion.badgeLabel,
        bannerImage: promotion.bannerImage,
        terms: promotion.terms,
        isInfiniteUse: promotion.isInfiniteUse ?? false,
        startDate: new Date(promotion.startDate),
        endDate: new Date(promotion.endDate),
        status: (promotion.status as any) || "ACTIVE",
        isActive: promotion.isActive !== false,
        updatedAt: new Date(),
      },
    });

  return (await fetchPromotionById(promotion.id))!;
}

export async function updatePromotionItem(
  promotionId: string,
  data: Partial<Promotion>,
): Promise<Promotion | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await fetchPromotionById(promotionId);
  if (!existing) return null;

  const merged: Promotion = { ...existing, ...data };

  await db
    .update(schema.promotions)
    .set({
      name: merged.name,
      title: merged.title || merged.name,
      description: merged.description,
      category: merged.category,
      promoType: merged.promoType,
      bonusPoints: merged.bonusPoints ?? 0,
      discountPercentage: merged.discountPercentage,
      discountAmount: merged.discountAmount,
      applicableServiceIds: merged.applicableServiceIds,
      applicableDaysOfWeek: merged.applicableDaysOfWeek,
      dedicatedDate: merged.dedicatedDate,
      pointPrice: merged.pointPrice as number,
      applicableTiers: merged.applicableTiers || [],
      applicableVehicleModels: merged.applicableVehicleModels || [],
      badgeLabel: merged.badgeLabel,
      bannerImage: merged.bannerImage,
      terms: merged.terms,
      isInfiniteUse: merged.isInfiniteUse ?? merged.isInifiteUse ?? false,
      startDate: new Date(merged.startDate),
      endDate: new Date(merged.endDate),
      status: (merged.status as any) || "ACTIVE",
      isActive: merged.isActive !== false,
      updatedAt: new Date(),
    })
    .where(sql`${schema.promotions.id} = ${promotionId}`);

  return fetchPromotionById(promotionId) as Promise<Promotion>;
}

export async function deletePromotionItem(
  promotionId: string,
): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const result = await db
    .delete(schema.promotions)
    .where(sql`${schema.promotions.id} = ${promotionId}`)
    .returning({ id: schema.promotions.id });

  return result.length > 0;
}

export async function claimPromotion(
  phone: string,
  promotionId: string,
): Promise<{
  success: boolean;
  message?: string;
  claimedPromo?: ClaimedPromo;
  pointsBalance?: number;
}> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const customerRows = await db
    .select()
    .from(schema.loyaltyCustomers)
    .where(sql`${schema.loyaltyCustomers.phone} = ${phone}`)
    .limit(1);
  const customer = customerRows[0];
  if (!customer) {
    return { success: false, message: "Customer account not found." };
  }

  const promo = await fetchPromotionById(promotionId);
  if (!promo || !promo.isActive) {
    return { success: false, message: "Promotion is inactive or not found." };
  }

  const alreadyClaimed = await db
    .select()
    .from(schema.claimedPromos)
    .where(
      and(
        eq(schema.claimedPromos.promoId, promo.id),
        eq(schema.claimedPromos.customerId, customer.id),
      ),
    )
    .limit(1);
  if (alreadyClaimed.length > 0) {
    return {
      success: false,
      message: "You have already claimed this promotion.",
    };
  }

  const pointCost =
    typeof promo.pointPrice === "number"
      ? promo.pointPrice
      : Number(promo.pointPrice) || 0;

  if (customer.pointsBalance < pointCost) {
    return {
      success: false,
      message: `Insufficient points. Required: ${pointCost}, Balance: ${customer.pointsBalance}.`,
    };
  }

  if (promo.requiredTier) {
    const custRank = TIER_ORDER[customer.tierId] ?? 0;
    const reqRank = TIER_ORDER[promo.requiredTier] ?? 0;
    if (custRank < reqRank) {
      return {
        success: false,
        message: `Requires ${promo.requiredTier} tier or higher. Current tier: ${customer.tierId}.`,
      };
    }
  }

  const now = new Date();
  const validUntilDate = new Date(now);
  validUntilDate.setDate(validUntilDate.getDate() + (promo.validityDays || 30));
  const newBalance = customer.pointsBalance - pointCost;

  if (pointCost > 0) {
    await db
      .update(schema.loyaltyCustomers)
      .set({ pointsBalance: newBalance, updatedAt: new Date() })
      .where(eq(schema.loyaltyCustomers.id, customer.id));

    await db.insert(schema.pointTransactions).values({
      id: createId(),
      customerId: customer.id,
      type: "spend",
      amount: pointCost,
      description: `Redeemed promo voucher: ${promo.title || promo.name}`,
    });
  }

  const claimedId = `voucher-${createId()}`;
  const validUntil =
    promo.validUntil || validUntilDate.toISOString().split("T")[0];

  await db.insert(schema.claimedPromos).values({
    id: claimedId,
    promoId: promo.id,
    customerId: customer.id,
    title: promo.title || promo.name,
    description: promo.description,
    perkIdentifier: promo.perkType || "VOUCHER",
    status: "ACTIVE",
    validUntil: new Date(validUntil),
  });

  const claimed: ClaimedPromo = {
    id: claimedId,
    promoId: promo.id,
    customerId: customer.id,
    title: promo.title || promo.name,
    description: promo.description,
    claimedAt: now.toISOString(),
    validUntil,
    status: "ACTIVE",
    perkIdentifier: promo.perkType || "VOUCHER",
    promoType: promo.promoType,
    discountPercentage: promo.discountPercentage,
    discountAmount: promo.discountAmount,
    bonusPoints: promo.bonusPoints,
    applicableServiceIds: promo.applicableServiceIds,
  };

  return {
    success: true,
    claimedPromo: claimed,
    pointsBalance: newBalance,
  };
}
