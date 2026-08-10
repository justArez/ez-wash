import type {
  LoyaltyCustomer,
  LoyaltyStore,
  RewardOffer,
} from "../models/loyalty.model";

export function suggestRewards(
  customer: LoyaltyCustomer,
  store: LoyaltyStore,
): RewardOffer[] {
  const now = new Date();
  const eligibleOffers = store.rewardOffers.filter((offer) =>
    offer.eligibleTiers.includes(customer.tierId),
  );

  return eligibleOffers
    .filter((offer) => {
      if (!offer.vehicleTypes || offer.vehicleTypes.length === 0) {
        return true;
      }
      return customer.vehicles.some((vehicle) =>
        offer.vehicleTypes?.includes(vehicle.type),
      );
    })
    .map((offer) => ({
      ...offer,
      title: offer.title,
      description: offer.description,
      pointsRequired: offer.pointsRequired,
      eligibleTiers: offer.eligibleTiers,
      vehicleTypes: offer.vehicleTypes,
    }))
    .sort((a, b) => a.pointsRequired - b.pointsRequired)
    .filter(
      (offer, index, arr) =>
        index === arr.findIndex((item) => item.id === offer.id),
    );
}
