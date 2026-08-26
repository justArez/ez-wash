import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { bankingInfo } from "../db/schema";
import type {
  BankingInfo,
  CreateBankingInfoInput,
  UpdateBankingInfoInput,
} from "../models/banking.model";

export function mapBankingInfoRow(row: any): BankingInfo {
  return {
    id: row.id,
    bankCode: row.bankCode,
    bankName: row.bankName,
    bankBranch: row.bankBranch || null,
    accountNumber: row.accountNumber,
    accountHolder: row.accountHolder,
    qrTemplate: row.qrTemplate || "compact2",
    isDefault: Boolean(row.isDefault),
    isActive: Boolean(row.isActive),
    note: row.note || null,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

/**
 * Fetch all banking info records (for Admin).
 */
export async function fetchAllBankingInfo(): Promise<BankingInfo[]> {
  const rows = await db
    .select()
    .from(bankingInfo)
    .orderBy(desc(bankingInfo.isDefault), desc(bankingInfo.createdAt));
  return rows.map(mapBankingInfoRow);
}

/**
 * Fetch the active default banking info record (for public / deposit modal).
 * If no default is designated, returns the first active record.
 */
export async function fetchActiveBankingInfo(): Promise<BankingInfo | null> {
  const defaultRows = await db
    .select()
    .from(bankingInfo)
    .where(eq(bankingInfo.isActive, true))
    .orderBy(desc(bankingInfo.isDefault), desc(bankingInfo.createdAt))
    .limit(1);

  if (defaultRows.length === 0) {
    return null;
  }
  return mapBankingInfoRow(defaultRows[0]);
}

/**
 * Fetch a single banking info by ID.
 */
export async function fetchBankingInfoById(
  id: string,
): Promise<BankingInfo | null> {
  const rows = await db
    .select()
    .from(bankingInfo)
    .where(eq(bankingInfo.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return mapBankingInfoRow(rows[0]);
}

/**
 * Create a new banking info record.
 * If marked as default, unsets default on all other records.
 */
export async function createBankingInfoItem(
  input: CreateBankingInfoInput,
): Promise<BankingInfo> {
  const isDefault = input.isDefault ?? false;
  const isActive = input.isActive ?? true;

  // Enforce only one active bank account at a time
  if (isActive) {
    await db
      .update(bankingInfo)
      .set({ isActive: false, isDefault: false, updatedAt: new Date() });
  } else if (isDefault) {
    await db
      .update(bankingInfo)
      .set({ isDefault: false, updatedAt: new Date() });
  }

  const [created] = await db
    .insert(bankingInfo)
    .values({
      bankCode: input.bankCode,
      bankName: input.bankName,
      bankBranch: input.bankBranch || null,
      accountNumber: input.accountNumber,
      accountHolder: input.accountHolder,
      qrTemplate: input.qrTemplate || "compact2",
      isDefault: isActive || isDefault,
      isActive,
      note: input.note || null,
    })
    .returning();

  return mapBankingInfoRow(created);
}

/**
 * Update an existing banking info record.
 * If marked as active or default, deactivates/unsets other records to enforce single active bank.
 */
export async function updateBankingInfoItem(
  id: string,
  input: UpdateBankingInfoInput,
): Promise<BankingInfo | null> {
  // Enforce only one active bank account at a time
  if (input.isActive === true) {
    await db
      .update(bankingInfo)
      .set({ isActive: false, isDefault: false, updatedAt: new Date() });
  } else if (input.isDefault === true) {
    await db
      .update(bankingInfo)
      .set({ isDefault: false, updatedAt: new Date() });
  }

  const updatePayload: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (input.bankCode !== undefined) updatePayload.bankCode = input.bankCode;
  if (input.bankName !== undefined) updatePayload.bankName = input.bankName;
  if (input.bankBranch !== undefined)
    updatePayload.bankBranch = input.bankBranch;
  if (input.accountNumber !== undefined)
    updatePayload.accountNumber = input.accountNumber;
  if (input.accountHolder !== undefined)
    updatePayload.accountHolder = input.accountHolder;
  if (input.qrTemplate !== undefined)
    updatePayload.qrTemplate = input.qrTemplate;
  if (input.isDefault !== undefined) updatePayload.isDefault = input.isDefault;
  if (input.isActive !== undefined) {
    updatePayload.isActive = input.isActive;
    if (input.isActive) {
      updatePayload.isDefault = true;
    }
  }
  if (input.note !== undefined) updatePayload.note = input.note;

  const [updated] = await db
    .update(bankingInfo)
    .set(updatePayload)
    .where(eq(bankingInfo.id, id))
    .returning();

  if (!updated) return null;
  return mapBankingInfoRow(updated);
}

/**
 * Delete a banking info record.
 */
export async function deleteBankingInfoItem(id: string): Promise<boolean> {
  const result = await db
    .delete(bankingInfo)
    .where(eq(bankingInfo.id, id))
    .returning();

  return result.length > 0;
}
