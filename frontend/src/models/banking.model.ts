export interface BankingInfo {
  id: string;
  bankCode: string;
  bankName: string;
  bankBranch?: string | null;
  accountNumber: string;
  accountHolder: string;
  qrTemplate?: string;
  isDefault: boolean;
  isActive: boolean;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankingInfoInput {
  bankCode: string;
  bankName: string;
  bankBranch?: string;
  accountNumber: string;
  accountHolder: string;
  qrTemplate?: string;
  isDefault?: boolean;
  isActive?: boolean;
  note?: string;
}

export interface UpdateBankingInfoInput {
  bankCode?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrTemplate?: string;
  isDefault?: boolean;
  isActive?: boolean;
  note?: string;
}
