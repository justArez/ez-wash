import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import type { LoyaltyStore } from "./models/loyalty.model";
import {
  DEFAULT_REWARD_OFFERS,
  DEFAULT_PROMOTIONS,
  TIERS,
} from "./models/loyalty.model";

const __dirname = fileURLToPath(new URL("./", import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const STORE_PATH = join(DATA_DIR, "loyalty-store.json");

const INITIAL_STORE: LoyaltyStore = {
  customers: [],
  tiers: Object.values(TIERS),
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
    return JSON.parse(payload) as LoyaltyStore;
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
