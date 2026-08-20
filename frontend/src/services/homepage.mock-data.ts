import type { Promotion, TimeSlot } from "../types/homepage.types";

const now = new Date();

const isoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (hour: number, minute: number): string => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export const mockPromotions: Promotion[] = [
  {
    id: "mock-spring-shine",
    name: "Summer Splash 20% Off",
    title: "Summer Splash 20% Off",
    description:
      "Automatic 20% discount on every exterior wash package this week.",
    discountPercentage: 20,
    loyaltyPointsRequired: 0,
    loyaltyPointsValue: 40,
    pointPrice: 0,
    badgeLabel: "Featured Deal",
    expiryDate: new Date(
      now.getTime() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "discount",
    terms:
      "Valid for one wash per customer. Cannot be combined with other offers.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "mock-double-points",
    name: "Double Points Tuesday",
    title: "Double Points Tuesday",
    description:
      "Earn twice the loyalty points when you wash with us on Tuesday.",
    discountPercentage: 0,
    bonusPoints: 80,
    loyaltyPointsRequired: 0,
    loyaltyPointsValue: 80,
    pointPrice: 0,
    badgeLabel: "Loyalty Boost",
    expiryDate: new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "points_bonus",
    terms: "Available every Tuesday during the promotional period.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "mock-welcome-wash",
    name: "Welcome Wash Discount",
    title: "Welcome Wash Discount",
    description: "New and existing members get 25% off their scheduled wash.",
    discountPercentage: 25,
    loyaltyPointsRequired: 0,
    loyaltyPointsValue: 25,
    pointPrice: 0,
    requiredTier: "MEMBER",
    tierGroup: "MEMBER TIER",
    badgeLabel: "Member Special",
    expiryDate: new Date(
      now.getTime() + 45 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "new_member",
    terms: "For loyalty members only. One redemption per account.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "prm-silver-1",
    name: "15% Off Detail Voucher",
    title: "15% Off Detail Voucher",
    description:
      "Redeem 300 points for a 15% discount voucher on complete interior or exterior detailing.",
    discountPercentage: 15,
    loyaltyPointsRequired: 300,
    loyaltyPointsValue: 0,
    pointPrice: 300,
    requiredTier: "SILVER",
    applicableTiers: ["silver", "gold", "platinum"],
    tierGroup: "SILVER TIER & ABOVE",
    perkType: "detail-discount-15",
    badgeLabel: "Silver+ Reward",
    expiryDate: new Date(
      now.getTime() + 60 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "tier_reward",
    terms: "Available for Silver, Gold, and Platinum tier members.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "prm-silver-2",
    name: "Free Air Freshener Perk",
    title: "Free Air Freshener Perk",
    description:
      "Redeem 150 points for a complimentary custom cabin fragrance upgrade.",
    discountPercentage: 0,
    loyaltyPointsRequired: 150,
    loyaltyPointsValue: 0,
    pointPrice: 150,
    requiredTier: "SILVER",
    applicableTiers: ["silver", "gold", "platinum"],
    tierGroup: "SILVER TIER & ABOVE",
    perkType: "free-air-freshener",
    badgeLabel: "Silver+ Perk",
    expiryDate: new Date(
      now.getTime() + 60 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "tier_reward",
    terms: "Redeemable with 150 loyalty points.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "prm-gold-1",
    name: "Free Nano Coating Shield",
    title: "Free Nano Coating Shield",
    description:
      "Complimentary nano-polymer protective coating shield applied during wash.",
    discountPercentage: 0,
    loyaltyPointsRequired: 1000,
    loyaltyPointsValue: 0,
    pointPrice: 1000,
    requiredTier: "GOLD",
    applicableTiers: ["gold", "platinum"],
    tierGroup: "GOLD TIER & ABOVE",
    perkType: "nano-coating-shield",
    badgeLabel: "Gold+ Exclusive",
    expiryDate: new Date(
      now.getTime() + 60 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "tier_reward",
    terms: "Exclusive for Gold and Platinum members.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "prm-platinum-1",
    name: "VIP Ceramic Treatment Voucher",
    title: "VIP Ceramic Treatment Voucher",
    description:
      "Exclusive Platinum voucher for full ceramic enhancement and paint sealant.",
    discountPercentage: 25,
    loyaltyPointsRequired: 300,
    loyaltyPointsValue: 0,
    pointPrice: 300,
    requiredTier: "PLATINUM",
    applicableTiers: ["platinum"],
    tierGroup: "PLATINUM TIER",
    perkType: "VIP_CERAMIC",
    badgeLabel: "Platinum VIP",
    expiryDate: new Date(
      now.getTime() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "tier_reward",
    terms: "Exclusive for Platinum tier members.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const createMockTimeSlots = (days = 7): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = Array.from({ length: 17 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  });

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);

    times.forEach(({ hour, minute }, timeIndex) => {
      const status =
        dayOffset === 2 && timeIndex === 5
          ? "maintenance"
          : dayOffset === 1 && timeIndex === 9
            ? "booked"
            : "available";
      const currentBookings =
        status === "maintenance" ? 0 : status === "booked" ? 4 : timeIndex % 5;
      const resolvedStatus =
        status === "available" && currentBookings >= 4 ? "booked" : status;

      slots.push({
        id: `mock-slot-${dayOffset}-${hour}-${minute}`,
        date: isoDate(date),
        time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        displayTime: formatTime(hour, minute),
        duration: 30,
        status: resolvedStatus,
        capacity: 4,
        currentBookings,
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
        dayDisplayDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    });
  }

  return slots;
};
