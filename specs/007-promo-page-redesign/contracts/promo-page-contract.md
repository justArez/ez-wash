# Interface & Component Contract: Promo Page Redesign

**Feature**: `007-promo-page-redesign` | **Date**: 2026-08-17

This document defines the component prop interfaces, service endpoints/methods, and state contracts for the redesigned Promo Page.

---

## 1. Component Interfaces

### 1.1 `PromoPageProps`

```typescript
import type { DashboardResponse } from "@/models/loyalty.model";
import type { GlobalPromotion, ClaimablePromo, ClaimedPromo } from "@/models/promo.model";

export interface PromoPageProps {
  dashboard: DashboardResponse | null;
  globalPromotions?: GlobalPromotion[];
  claimablePromos?: ClaimablePromo[];
  onClaimPromo?: (promo: ClaimablePromo) => Promise<void> | void;
  onUsePromo?: (promo: ClaimedPromo) => void;
  onOpenSignIn?: () => void;
}
```

---

### 1.2 `ClaimablePromoCardProps`

```typescript
export interface ClaimablePromoCardProps {
  promo: ClaimablePromo;
  isLoggedIn: boolean;
  currentTierRank: number;
  pointsBalance: number;
  onClaim: (promo: ClaimablePromo) => void;
  isSubmitting?: boolean;
}
```

---

### 1.3 `ClaimedPromoCardProps`

```typescript
export interface ClaimedPromoCardProps {
  voucher: ClaimedPromo;
  onUseNow: (voucher: ClaimedPromo) => void;
}
```

---

## 2. Dynamic Button Interaction Contract

| Condition | Default Display | Hover Display | Disabled? | Variant / Styling |
| :--- | :--- | :--- | :---: | :--- |
| **Eligible** | `[ 300 pts ]` | `[ Claim ]` | No | Primary / Emerald / Indigo |
| **Lacks Tier** | `[ LACKS TIER ]` | `[ LACKS TIER ]` | Yes | Secondary / Muted Gray |
| **Insufficient Points** | `[ INSUFFICIENT PTS ]` | `[ INSUFFICIENT PTS ]` | Yes | Outline / Warning Muted |
| **Guest / Unauth** | `[ Sign In to Claim ]` | `[ Sign In ]` | No | Outline / Secondary |

---

## 3. Service & State Method Contract

```typescript
export interface LoyaltyPromoService {
  getGlobalPromotions(): Promise<GlobalPromotion[]>;
  getClaimablePromotions(tier?: string): Promise<ClaimablePromo[]>;
  claimPromotion(customerId: string, promoId: string): Promise<{
    success: boolean;
    updatedBalance: number;
    claimedPromo: ClaimedPromo;
  }>;
}
```
