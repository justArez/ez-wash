# Quickstart Validation Guide: Promo Page Redesign

**Feature**: `007-promo-page-redesign` | **Date**: 2026-08-17

This guide outlines runnable verification procedures and manual testing scenarios to validate the redesigned Promo Page end-to-end.

---

## 1. Prerequisites & Environment Setup

1. **Working Directory**: `frontend/`
2. **Start Development Server**:
   ```powershell
   npm run dev
   ```
3. Open browser at `http://localhost:5173/promo` (or click the **Promo** link in the navigation header).

---

## 2. Validation Scenarios

### Scenario 1: Guest / Unauthenticated State
1. **Action**: Navigate to `/promo` without logging in.
2. **Expected Outcome**:
   - Header shows guest state.
   - Global Active Promotions banner displays active system-wide campaigns.
   - Tier-categorized promo cards show "Sign In to Claim" buttons.
   - "Your Promos" section prompts user to sign in to view claimed vouchers.

---

### Scenario 2: Gold Tier User with 1,500 Points (Demo Account)
1. **Action**: Click "Sign In", choose the Demo account (or enter `555-0100` / Gold tier demo), and navigate to `/promo`.
2. **Expected Outcome**:
   - Header shows user avatar, phone/username, and `1500 pts` balance.
   - Subheader/Section displays: `Current Tier: GOLD | Available Points: 1500 pts`.
   - **Silver Tier & Above**: Cards (e.g., "15% Off Detail", 300 pts) show `[ 300 pts ]` in default state, transitioning to `[ Claim ]` on hover.
   - **Gold Tier & Above**: Cards (e.g., "Free Nano Coating", 1000 pts) show `[ 1000 pts ]` transitioning to `[ Claim ]` on hover.
   - **Platinum Tier**: Card shows disabled `[ LACKS TIER ]`.

---

### Scenario 3: Claiming a Promo Voucher
1. **Action**: Hover over the "Free Nano Coating" button (`1000 pts`) and click "Claim".
2. **Expected Outcome**:
   - Points balance immediately decrements from `1500 pts` to `500 pts`.
   - The button for "Free Nano Coating" updates.
   - Other cards requiring > 500 points (e.g., 800 pts card) transition immediately to disabled `[ INSUFFICIENT PTS ]`.
   - The newly claimed voucher appears in the "Your Promos (Claimed)" section displaying:
     - Title: "Free Nano Coating"
     - Expiry: "Valid till: [Date]"
     - Action button: `[ USE NOW ]`.

---

### Scenario 4: "USE NOW" Launches Booking Workflow
1. **Action**: In the "Your Promos (Claimed)" section, click `[ USE NOW ]` on a claimed voucher.
2. **Expected Outcome**:
   - The reservation/booking modal opens immediately.
   - The selected voucher's discount or perk is pre-selected or highlighted for the booking.

---

## 3. Automated Validation Commands

```powershell
# From frontend directory
npm run lint
npm run build
```
