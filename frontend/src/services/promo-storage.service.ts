import type { ClaimedPromo } from "../models/promo.model";
import { initialClaimedPromos } from "./loyalty.mock-data";

const CLAIMED_PROMOS_STORAGE_KEY = "ezwash-claimed-promos";

export function loadClaimedPromos(customerId?: string): ClaimedPromo[] {
  try {
    const key = customerId
      ? `${CLAIMED_PROMOS_STORAGE_KEY}-${customerId}`
      : CLAIMED_PROMOS_STORAGE_KEY;
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return initialClaimedPromos;
    }
    return JSON.parse(raw) as ClaimedPromo[];
  } catch {
    return initialClaimedPromos;
  }
}

export function saveClaimedPromos(
  promos: ClaimedPromo[],
  customerId?: string,
): void {
  try {
    const key = customerId
      ? `${CLAIMED_PROMOS_STORAGE_KEY}-${customerId}`
      : CLAIMED_PROMOS_STORAGE_KEY;
    window.localStorage.setItem(key, JSON.stringify(promos));
  } catch (err) {
    console.error("Failed to persist claimed promos:", err);
  }
}

export function appendClaimedPromo(
  promo: ClaimedPromo,
  customerId?: string,
): ClaimedPromo[] {
  const current = loadClaimedPromos(customerId);
  const updated = [promo, ...current.filter((p) => p.id !== promo.id)];
  saveClaimedPromos(updated, customerId);
  return updated;
}
