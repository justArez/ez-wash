/**
 * Car Wash Center bank account used for seat-deposit transfers.
 * Update these with the real account before going live.
 */
export const CAR_WASH_BANK_ACCOUNT = {
  bankCode: "vietcombank", // VietQR bank short-name or BIN, e.g. "vietcombank", "970436"
  bankLabel: "Vietcombank",
  accountNumber: "1234567890",
  accountName: "EZ WASH CAR CARE CENTER",
};

/** Loyalty tiers ranked lowest to highest. */
export const TIER_ORDER = ["member", "silver", "gold", "platinum"];

/** Deposit percentage owed by the lowest tier (Member). Highest tier pays 0%. */
export const MEMBER_DEPOSIT_PERCENT = 50;

/** Service prices are stored in USD; convert to VND for bank transfers. */
export const USD_TO_VND_RATE = 26110;

/**
 * Deposit percentage for a given tier, stepped evenly between
 * MEMBER_DEPOSIT_PERCENT (lowest tier) and 0% (highest tier).
 */
export function getDepositPercentForTier(tierId?: string): number {
  const rank = Math.max(
    0,
    TIER_ORDER.indexOf((tierId || "member").toLowerCase()),
  );
  const steps = TIER_ORDER.length - 1;
  return Math.round(MEMBER_DEPOSIT_PERCENT * (1 - rank / steps));
}

/**
 * Deposit amount owed by a customer's tier, computed off the booking's
 * service price (in USD, converted to VND) and rounded to the nearest
 * 1,000 VND.
 */
export function getDepositAmountForTier(
  tierId: string | undefined,
  bookingPriceUsd: number,
): number {
  const percent = getDepositPercentForTier(tierId);
  const amountVnd = bookingPriceUsd * USD_TO_VND_RATE * (percent / 100);
  return Math.round(amountVnd / 1000) * 1000;
}

/** Reference note so staff can match incoming transfers to a booking. */
export function buildDepositTransferNote(bookingId: string): string {
  return `DEPOSIT ${bookingId.slice(0, 8).toUpperCase()}`;
}

/**
 * Builds an auto-generated, scannable VietQR bank-transfer QR code image
 * URL (https://vietqr.io) pre-filled with the account, amount and note.
 */
export function buildDepositQrUrl(
  bookingId: string,
  amount: number,
  bankOverride?: {
    bankCode?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrTemplate?: string;
  },
): string {
  const bankCode = bankOverride?.bankCode || CAR_WASH_BANK_ACCOUNT.bankCode;
  const accountNumber =
    bankOverride?.accountNumber || CAR_WASH_BANK_ACCOUNT.accountNumber;
  const accountName =
    bankOverride?.accountHolder || CAR_WASH_BANK_ACCOUNT.accountName;
  const template = bankOverride?.qrTemplate || "compact2";

  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: buildDepositTransferNote(bookingId),
    accountName,
  });
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png?${params.toString()}`;
}
