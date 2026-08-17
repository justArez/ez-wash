# Research: Promo Page Redesign

**Feature**: `007-promo-page-redesign` | **Date**: 2026-08-17

This document captures architecture decisions, technical options, and patterns evaluated for redesigning the customer Promo Page with a wireframe-accurate layout and dynamic tier-based claim interactions.

---

## 1. Global Active Promotions Presentation & Data Sourcing

### Context
The top of the Promo Page requires a visually distinct horizontal banner/carousel displaying active system-wide marketing campaigns (e.g., "Summer Splash: 20% Off All Washes", "Free Tire Shine Weekend").

### Decision
Reuse the existing frontend promotional carousel / banner component pattern and connect to `homepage.mock-data.ts` / `usePromotions` hook data or `Promotion` models.

### Rationale
- The application already defines active system promotions in `homepage.types.ts` (`Promotion`) and provides mock/backend promotion endpoints.
- Reusing the carousel/horizontal scroll pattern ensures consistent visual branding with the homepage while keeping the component lightweight and responsive.

### Alternatives Considered
- *Hardcoding promo text inside the page component*: Rejected because it prevents dynamic promo configuration and violates shared model consistency.
- *Creating a separate bespoke global promo widget from scratch*: Rejected because `promotion-carousel` or standard horizontal cards already fulfill the wireframe layout cleanly.

---

## 2. Tier-Categorized Claimable Promos & Dynamic Button Interaction

### Context
Acclaimable promos must be grouped by membership tiers (e.g., "Silver Tier & Above", "Gold Tier & Above", "Platinum Tier").
The action button on each card needs dynamic states:
- Default state: Displays point price (e.g., `300 pts`).
- Hover/Focus state on eligible cards: Dynamically transitions to `Claim`.
- Disabled state 1 (Customer tier < required tier): Displays `LACKS TIER` in disabled styling.
- Disabled state 2 (Customer tier >= required tier, but balance < point price): Displays `INSUFFICIENT PTS` in disabled styling.

### Decision
Implement a dedicated `PromoCard` / `ClaimablePromoCard` subcomponent that encapsulates tier comparison, point threshold checking, and CSS/hover transitions for the action button.

### Rationale
- Pure CSS / React state transition on hover allows smooth transformation between `{points} pts` and `Claim`.
- Decoupling eligibility calculation into a pure helper (`checkPromoEligibility(customer, promo)`) makes it unit testable and avoids duplicate conditional rendering logic across tier groups.
- Tiers are normalized in order (`Member` (0), `Silver` (1), `Gold` (2), `Platinum` (3)) to enable simple hierarchical comparisons (`customerTierLevel >= promoRequiredTierLevel`).

### Alternatives Considered
- *Single flat list with tier filters*: Rejected because the wireframe explicitly groups cards under visual tier headers (`-- SILVER TIER & ABOVE --`, `-- GOLD TIER & ABOVE --`, etc.) to showcase aspirational rewards for higher tiers.
- *Modal confirmation for every claim*: Rejected as unnecessary friction for standard point redemptions; an inline toast/confirmation + instant deduction provides a superior user experience.

---

## 3. Claimed Promos Management & Booking Flow Bridge

### Context
The "Your Promos (Claimed)" section shows rewards the user has successfully redeemed, showing valid date ranges and a "USE NOW" call-to-action that launches the booking modal with the discount/perk applied.

### Decision
Manage claimed vouchers in client state and persist them via `DashboardResponse.appliedPerks` or a structured `claimedPromos` collection in storage/state.
When the user clicks "USE NOW", invoke `onOpenBookings(promoContext)` to open `BookingModal` with the corresponding service or perk pre-selected.

### Rationale
- Seamless connection between claiming a promo and booking a wash satisfies User Story 2 and Wireframe requirements.
- Passing the promo perk context into `onOpenBookings` allows the booking modal to highlight the applied discount automatically.

### Alternatives Considered
- *Navigate to separate booking page without opening modal*: Rejected because the wireframe and detail spec explicitly state "USE NOW can redirect the user straight to the Booking Modal to apply their discount".

---

## 4. UI Component & Styling Architecture (shadcn / Tailwind / SCSS)

### Context
The page requires styling conforming to the wireframe layout with modern shadcn/ui components (`Card`, `Badge`, `Button`, `Dialog`).

### Decision
Compose `PromoPage` using:
- `@/components/ui/card` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) for promo items.
- `@/components/ui/badge` for tier labels, discount tags, and validity badges.
- `@/components/ui/button` with hover animation classes for dynamic claim buttons.
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with fallback support down to 320px viewport width.
- SCSS module/file `promo.page.scss` using existing EzWash CSS variables.

### Rationale
- Maintains consistency with the homepage (`004`) and booking page (`005`) shadcn UI implementations.
- Fully accessible keyboard navigation and WCAG contrast compliance.
