import type {
  ClaimedPromo,
  LoyaltyCustomer,
  LoyaltyStore,
  PointTransaction,
  Promotion,
} from "../models/loyalty.model";
import { findCustomer } from "./loyalty.service";

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
];

export function ensurePromotions(store: LoyaltyStore) {
  if (!store.promotions) {
    store.promotions = [...DEFAULT_PROMOTIONS];
  }
  return store.promotions;
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
    discountPercentage: data.discountPercentage ?? 0,
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
      `${data.discountPercentage ? data.discountPercentage + "% OFF" : "PROMO"}`,
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
  if (data.discountPercentage !== undefined)
    promotion.discountPercentage = data.discountPercentage;
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
