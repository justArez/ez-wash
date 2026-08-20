import type {
  ClaimedPromo,
  LoyaltyCustomer,
  LoyaltyStore,
  PointTransaction,
  Promotion,
} from "../models/loyalty.model";
import { findCustomer } from "./loyalty.service";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

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

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: "promo-global-splash",
    name: "Summer Splash: 20% Off All Washes",
    title: "Summer Splash: 20% Off All Washes",
    description: "Automatic 20% discount on every exterior package this week.",
    category: "discount",
    discountPercentage: 20,
    pointPrice: 0,
    loyaltyPointsRequired: 0,
    applicableTiers: [],
    applicableVehicleModels: [],
    badgeLabel: "Featured Deal",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-global-bonus",
    name: "Double Points Tuesday",
    title: "Double Points Tuesday",
    description: "Earn twice the loyalty points on Tuesday bookings.",
    category: "points_bonus",
    bonusPoints: 80,
    discountPercentage: 0,
    pointPrice: 0,
    loyaltyPointsRequired: 0,
    applicableTiers: [],
    applicableVehicleModels: [],
    badgeLabel: "Loyalty Boost",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-membership-1",
    name: "Silver+ Welcome Bonus",
    title: "10% Off Premium Wash",
    description:
      "Silver tier and above receive 10% off a premium wash when booking within their loyalty window.",
    category: "discount",
    discountPercentage: 10,
    pointPrice: 0,
    loyaltyPointsRequired: 0,
    applicableTiers: ["silver", "gold", "platinum"],
    requiredTier: "SILVER",
    tierGroup: "SILVER TIER & ABOVE",
    applicableVehicleModels: [],
    badgeLabel: "10% OFF",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-silver-detail",
    name: "15% Off Detail Voucher",
    title: "15% Off Detail Voucher",
    description:
      "15% discount voucher for complete interior or exterior detailing.",
    category: "tier_reward",
    discountPercentage: 15,
    pointPrice: 300,
    loyaltyPointsRequired: 300,
    applicableTiers: ["silver", "gold", "platinum"],
    requiredTier: "SILVER",
    tierGroup: "SILVER TIER & ABOVE",
    perkType: "detail-discount-15",
    applicableVehicleModels: [],
    badgeLabel: "Silver+ Reward",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-silver-freshener",
    name: "Free Air Freshener",
    title: "Free Air Freshener",
    description:
      "Complimentary custom fragrance tree hanging in vehicle cabin.",
    category: "tier_reward",
    discountPercentage: 0,
    pointPrice: 150,
    loyaltyPointsRequired: 150,
    applicableTiers: ["silver", "gold", "platinum"],
    requiredTier: "SILVER",
    tierGroup: "SILVER TIER & ABOVE",
    perkType: "free-air-freshener",
    applicableVehicleModels: [],
    badgeLabel: "Silver+ Perk",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-gold-nano",
    name: "Free Nano Coating",
    title: "Free Nano Coating",
    description:
      "Complimentary nano polymer protective shield applied on finish.",
    category: "tier_reward",
    discountPercentage: 0,
    pointPrice: 1000,
    loyaltyPointsRequired: 1000,
    applicableTiers: ["gold", "platinum"],
    requiredTier: "GOLD",
    tierGroup: "GOLD TIER & ABOVE",
    perkType: "nano-coating-shield",
    applicableVehicleModels: [],
    badgeLabel: "Gold+ Exclusive",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-gold-ride",
    name: "Motorcycle Express Treat",
    title: "Free Express Enhancement",
    description:
      "Gold and Platinum motorcycle riders receive a free express enhancement with a premium service.",
    category: "tier_reward",
    discountPercentage: 0,
    pointPrice: 150,
    loyaltyPointsRequired: 150,
    applicableTiers: ["gold", "platinum"],
    requiredTier: "GOLD",
    tierGroup: "GOLD TIER & ABOVE",
    perkType: "EXPRESS_TREAT",
    applicableVehicleModels: [],
    badgeLabel: "GOLD & ABOVE",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-plat-bundle",
    name: "Platinum Exclusive Bundle",
    title: "VIP Ceramic Treatment Voucher",
    description:
      "Exclusive voucher for Platinum members to receive a VIP ceramic enhancement.",
    category: "tier_reward",
    discountPercentage: 25,
    pointPrice: 300,
    loyaltyPointsRequired: 300,
    applicableTiers: ["platinum"],
    requiredTier: "PLATINUM",
    tierGroup: "PLATINUM TIER",
    perkType: "VIP_CERAMIC",
    applicableVehicleModels: [],
    badgeLabel: "PLATINUM ONLY",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
  {
    id: "promo-plat-spa",
    name: "Ultimate Spa Wash",
    title: "Ultimate Spa Wash",
    description:
      "Comprehensive 90-minute full restoration, machine glaze, and ozone treatment.",
    category: "tier_reward",
    discountPercentage: 0,
    pointPrice: 2500,
    loyaltyPointsRequired: 2500,
    applicableTiers: ["platinum"],
    requiredTier: "PLATINUM",
    tierGroup: "PLATINUM TIER",
    perkType: "ultimate-spa-wash",
    applicableVehicleModels: [],
    badgeLabel: "Platinum Elite",
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    validUntil: "2026-12-31",
    validRange: "2026-08-01 - 2026-12-31",
    status: "ACTIVE",
    isActive: true,
  },
];

export function ensurePromotions(store: LoyaltyStore) {
  if (!store.promotions) {
    store.promotions = [...DEFAULT_PROMOTIONS];
  }
  return store.promotions;
}

export async function fetchAllPromotions(
  store: LoyaltyStore,
  onlyActive = false,
): Promise<Promotion[]> {
  let promos: Promotion[] = [];
  if (db) {
    try {
      const rows = await db.select().from(schema.promotions);
      if (rows && rows.length > 0) {
        promos = rows.map((r) => ({
          id: r.id,
          name: r.name,
          title: r.title || r.name,
          promoName: r.name,
          description: r.description,
          category: r.category || "discount",
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
          startDate: r.startDate.toISOString().split("T")[0],
          endDate: r.endDate.toISOString().split("T")[0],
          validUntil: r.endDate.toISOString().split("T")[0],
          validRange: `${r.startDate.toISOString().split("T")[0]} - ${r.endDate.toISOString().split("T")[0]}`,
          status: r.status as any,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Could not load promotions from Postgres DB:", err);
    }
  }

  if (promos.length === 0) {
    promos = getAllPromotions(store, false);
  }

  if (onlyActive) {
    promos = promos.filter(
      (p) => p.isActive !== false && p.status !== "INACTIVE",
    );
  }

  return promos;
}

export async function fetchPromotionById(
  store: LoyaltyStore,
  id: string,
): Promise<Promotion | undefined> {
  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.promotions)
        .where(sql`${schema.promotions.id} = ${id}`)
        .limit(1);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          title: r.title || r.name,
          promoName: r.name,
          description: r.description,
          category: r.category || "discount",
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
    } catch (err) {
      console.warn("Could not fetch promotion by id from Postgres DB:", err);
    }
  }

  return getPromotionById(store, id);
}

export async function createPromotionItem(
  store: LoyaltyStore,
  data: Partial<Promotion>,
): Promise<Promotion> {
  const promotion = createPromotion(store, data);

  if (db) {
    try {
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
          pointPrice: promotion.pointPrice,
          applicableTiers: promotion.applicableTiers || [],
          applicableVehicleModels: promotion.applicableVehicleModels || [],
          badgeLabel: promotion.badgeLabel,
          bannerImage: promotion.bannerImage,
          terms: promotion.terms,
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
            pointPrice: promotion.pointPrice,
            applicableTiers: promotion.applicableTiers || [],
            applicableVehicleModels: promotion.applicableVehicleModels || [],
            badgeLabel: promotion.badgeLabel,
            bannerImage: promotion.bannerImage,
            terms: promotion.terms,
            startDate: new Date(promotion.startDate),
            endDate: new Date(promotion.endDate),
            status: (promotion.status as any) || "ACTIVE",
            isActive: promotion.isActive !== false,
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.warn("Could not persist created promotion to Postgres DB:", err);
    }
  }

  return promotion;
}

export async function updatePromotionItem(
  store: LoyaltyStore,
  promotionId: string,
  data: Partial<Promotion>,
): Promise<Promotion | null> {
  const promotion = updatePromotion(store, promotionId, data);
  if (!promotion) return null;

  if (db) {
    try {
      await db
        .update(schema.promotions)
        .set({
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
          pointPrice: promotion.pointPrice,
          applicableTiers: promotion.applicableTiers || [],
          applicableVehicleModels: promotion.applicableVehicleModels || [],
          badgeLabel: promotion.badgeLabel,
          bannerImage: promotion.bannerImage,
          terms: promotion.terms,
          startDate: new Date(promotion.startDate),
          endDate: new Date(promotion.endDate),
          status: (promotion.status as any) || "ACTIVE",
          isActive: promotion.isActive !== false,
          updatedAt: new Date(),
        })
        .where(sql`${schema.promotions.id} = ${promotionId}`);
    } catch (err) {
      console.warn("Could not update promotion in Postgres DB:", err);
    }
  }

  return promotion;
}

export async function deletePromotionItem(
  store: LoyaltyStore,
  promotionId: string,
): Promise<boolean> {
  const success = deletePromotion(store, promotionId);
  if (!success) return false;

  if (db) {
    try {
      await db
        .delete(schema.promotions)
        .where(sql`${schema.promotions.id} = ${promotionId}`);
    } catch (err) {
      console.warn("Could not delete promotion from Postgres DB:", err);
    }
  }

  return true;
}

export function getAllPromotions(
  store: LoyaltyStore,
  onlyActive = false,
): Promotion[] {
  const promos = ensurePromotions(store);
  if (onlyActive) {
    return promos.filter(
      (p) => p.isActive !== false && p.status !== "INACTIVE",
    );
  }
  return promos;
}

export function getPromotionById(
  store: LoyaltyStore,
  id: string,
): Promotion | undefined {
  const promos = ensurePromotions(store);
  return promos.find((p) => p.id === id);
}

export function createPromotion(
  store: LoyaltyStore,
  data: Partial<Promotion>,
): Promotion {
  ensurePromotions(store);
  const now = new Date().toISOString();
  const promotion: Promotion = {
    id:
      data.id?.trim() ||
      `promo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name?.trim() || data.title?.trim() || "New Promotion",
    title: data.title?.trim() || data.name?.trim() || "New Promotion",
    promoName: data.promoName?.trim() || data.name?.trim() || "New Promotion",
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
    loyaltyPointsRequired:
      data.loyaltyPointsRequired ??
      (typeof data.pointPrice === "number" ? data.pointPrice : 0),
    applicableTiers: data.applicableTiers ?? [],
    applicableVehicleModels: data.applicableVehicleModels ?? [],
    requiredTier: data.requiredTier,
    tierGroup: data.tierGroup,
    perkType: data.perkType || "GENERAL_DISCOUNT",
    badgeLabel:
      data.badgeLabel ||
      `${data.discountPercentage ? data.discountPercentage + "% OFF" : data.bonusPoints ? "+" + data.bonusPoints + " PTS" : "PROMO"}`,
    bannerImage: data.bannerImage,
    terms: data.terms,
    startDate: data.startDate ?? now.slice(0, 10),
    endDate: data.endDate ?? now.slice(0, 10),
    validUntil: data.validUntil ?? data.endDate ?? now.slice(0, 10),
    validRange:
      data.validRange ||
      `${data.startDate ?? now.slice(0, 10)} - ${data.endDate ?? now.slice(0, 10)}`,
    status: data.status || "ACTIVE",
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.promotions.push(promotion);
  return promotion;
}

export function updatePromotion(
  store: LoyaltyStore,
  promotionId: string,
  data: Partial<Promotion>,
): Promotion | null {
  ensurePromotions(store);
  const promotion = store.promotions.find((item) => item.id === promotionId);
  if (!promotion) {
    return null;
  }
  if (data.name !== undefined) promotion.name = data.name;
  if (data.title !== undefined) promotion.title = data.title;
  if (data.promoName !== undefined) promotion.promoName = data.promoName;
  if (data.description !== undefined) promotion.description = data.description;
  if (data.category !== undefined) promotion.category = data.category;
  if (data.promoType !== undefined) promotion.promoType = data.promoType;
  if (data.bonusPoints !== undefined) promotion.bonusPoints = data.bonusPoints;
  if (data.discountPercentage !== undefined)
    promotion.discountPercentage = data.discountPercentage;
  if (data.discountAmount !== undefined)
    promotion.discountAmount = data.discountAmount;
  if (data.applicableServiceIds !== undefined)
    promotion.applicableServiceIds = data.applicableServiceIds;
  if (data.applicableDaysOfWeek !== undefined)
    promotion.applicableDaysOfWeek = data.applicableDaysOfWeek;
  if (data.dedicatedDate !== undefined)
    promotion.dedicatedDate = data.dedicatedDate;
  if (data.pointPrice !== undefined) promotion.pointPrice = data.pointPrice;
  if (data.applicableTiers !== undefined)
    promotion.applicableTiers = data.applicableTiers;
  if (data.applicableVehicleModels !== undefined)
    promotion.applicableVehicleModels = data.applicableVehicleModels;
  if (data.requiredTier !== undefined)
    promotion.requiredTier = data.requiredTier;
  if (data.tierGroup !== undefined) promotion.tierGroup = data.tierGroup;
  if (data.perkType !== undefined) promotion.perkType = data.perkType;
  if (data.badgeLabel !== undefined) promotion.badgeLabel = data.badgeLabel;
  if (data.bannerImage !== undefined) promotion.bannerImage = data.bannerImage;
  if (data.startDate !== undefined) promotion.startDate = data.startDate;
  if (data.endDate !== undefined) promotion.endDate = data.endDate;
  if (data.validUntil !== undefined) promotion.validUntil = data.validUntil;
  if (data.validRange !== undefined) promotion.validRange = data.validRange;
  if (data.status !== undefined) promotion.status = data.status;
  if (data.isActive !== undefined) promotion.isActive = data.isActive;
  promotion.updatedAt = new Date().toISOString();
  return promotion;
}

export function deletePromotion(
  store: LoyaltyStore,
  promotionId: string,
): boolean {
  ensurePromotions(store);
  const index = store.promotions.findIndex((item) => item.id === promotionId);
  if (index === -1) {
    return false;
  }
  store.promotions.splice(index, 1);
  return true;
}

export function claimPromotion(
  store: LoyaltyStore,
  phone: string,
  promotionId: string,
): {
  success: boolean;
  message?: string;
  claimedPromo?: ClaimedPromo;
  pointsBalance?: number;
} {
  const customer = findCustomer(store, phone);
  if (!customer) {
    return { success: false, message: "Customer account not found." };
  }

  const promo = getPromotionById(store, promotionId);
  if (!promo || !promo.isActive) {
    return { success: false, message: "Promotion is inactive or not found." };
  }

  // Check if customer already claimed this promotion (claim once per user)
  const alreadyClaimed = customer.claimedPromos?.some(
    (item) => item.promoId === promo.id,
  );
  if (alreadyClaimed) {
    return {
      success: false,
      message: "You have already claimed this promotion.",
    };
  }

  const pointCost =
    typeof promo.pointPrice === "number"
      ? promo.pointPrice
      : Number(promo.pointPrice) || 0;

  // Check point balance
  if (customer.pointsBalance < pointCost) {
    return {
      success: false,
      message: `Insufficient points. Required: ${pointCost}, Balance: ${customer.pointsBalance}.`,
    };
  }

  // Check tier requirement if applicable
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

  // Deduct points
  if (pointCost > 0) {
    customer.pointsBalance -= pointCost;
    const tx: PointTransaction = {
      id: createId(),
      type: "spend",
      amount: pointCost,
      date: now.toISOString(),
      description: `Redeemed promo voucher: ${promo.title || promo.name}`,
    };
    customer.pointHistory.push(tx);
  }

  const claimed: ClaimedPromo = {
    id: `voucher-${createId()}`,
    promoId: promo.id,
    customerId: customer.id,
    title: promo.title || promo.name,
    description: promo.description,
    claimedAt: now.toISOString(),
    validUntil: promo.validUntil || validUntilDate.toISOString().split("T")[0],
    status: "ACTIVE",
    perkIdentifier: promo.perkType || "VOUCHER",
    promoType: promo.promoType,
    discountPercentage: promo.discountPercentage,
    discountAmount: promo.discountAmount,
    bonusPoints: promo.bonusPoints,
    applicableServiceIds: promo.applicableServiceIds,
  };

  customer.claimedPromos = customer.claimedPromos || [];
  customer.claimedPromos.push(claimed);
  customer.updatedAt = now.toISOString();

  return {
    success: true,
    claimedPromo: claimed,
    pointsBalance: customer.pointsBalance,
  };
}
