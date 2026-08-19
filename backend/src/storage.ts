import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import type { LoyaltyStore } from "./models/loyalty.model";
import {
  DEFAULT_REWARD_OFFERS,
  DEFAULT_PROMOTIONS,
  TIERS,
} from "./models/loyalty.model";
import { DEFAULT_SERVICES } from "./services/service.service";
import { DEFAULT_TIER_SETS } from "./services/tier-set.service";

const __dirname = fileURLToPath(new URL("./", import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const STORE_PATH = join(DATA_DIR, "loyalty-store.json");

const INITIAL_STORE: LoyaltyStore = {
  customers: [],
  tiers: Object.values(TIERS),
  tierSets: DEFAULT_TIER_SETS,
  services: DEFAULT_SERVICES,
  rewardOffers: DEFAULT_REWARD_OFFERS,
  promotions: DEFAULT_PROMOTIONS,
  auditLogs: [],
  lastTierEvaluationDate: new Date().toISOString().split("T")[0],
};

export function loadStore(): LoyaltyStore {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!existsSync(STORE_PATH)) {
    writeFileSync(STORE_PATH, JSON.stringify(INITIAL_STORE, null, 2), "utf8");
    return INITIAL_STORE;
  }

  try {
    const payload = readFileSync(STORE_PATH, "utf8");
    const store = JSON.parse(payload) as LoyaltyStore;

    if (!store.tiers || store.tiers.length === 0) {
      store.tiers = Object.values(TIERS);
    }
    if (!store.tierSets || store.tierSets.length === 0) {
      store.tierSets = [...DEFAULT_TIER_SETS];
    }
    if (!store.services || store.services.length === 0) {
      store.services = [...DEFAULT_SERVICES];
    }
    if (!store.promotions || store.promotions.length === 0) {
      store.promotions = [...DEFAULT_PROMOTIONS];
    }
    if (!store.rewardOffers || store.rewardOffers.length === 0) {
      store.rewardOffers = [...DEFAULT_REWARD_OFFERS];
    }
    if (!store.auditLogs) {
      store.auditLogs = [];
    }

    for (const customer of store.customers || []) {
      customer.lateCancellationWarningCount ??= 0;
      customer.priorityStatus ??=
        customer.lateCancellationWarningCount >= 3
          ? "LOW_PRIORITIED"
          : "normal";
      customer.bookingHistory = (customer.bookingHistory || []).map(
        (booking) => ({
          ...booking,
          status: booking.status ?? "confirmed",
        }),
      );
    }
    return store;
  } catch (error) {
    writeFileSync(STORE_PATH, JSON.stringify(INITIAL_STORE, null, 2), "utf8");
    return INITIAL_STORE;
  }
}

export function saveStore(store: LoyaltyStore): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
