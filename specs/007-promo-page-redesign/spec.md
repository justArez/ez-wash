# Feature Specification: Promo Page Redesign

**Feature Branch**: `007-promo-page-redesign`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "For Promo Page, given the UI wireframe in doc/wireframes/promo-page-wireframe.png and the spec in attached folder (doc/promo-page-doc/detail-spec.md, doc/promo-page-doc/ui-wireframe.md)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Claim Tier-Eligible Promotions (Priority: P1)

As an authenticated customer, I want to view promotions organized by loyalty tier, see point costs and availability based on my current tier and balance, and claim eligible rewards so that I can get discounts and free add-ons on my car washes.

**Why this priority**: The core value proposition of the promo page is allowing loyalty customers to discover and redeem their earned points for promotions according to their tier level.

**Independent Test**: Can be tested by signing in as a Gold member with 1,500 points, viewing promotions categorized under Silver+, Gold+, and Platinum, and claiming an eligible Gold reward ("Free Nano Coating" for 1,000 pts). Upon claim, point balance deducts to 500 pts, and the reward is added to "Your Promos".

**Acceptance Scenarios**:

1. **Given** a logged-in user with Gold tier and 1,500 points, **When** they navigate to the Promo page, **Then** they see their tier ("GOLD") and balance ("1500 pts") in the context header/section, and eligible promotions under "Silver Tier & Above" and "Gold Tier & Above" display their point prices (e.g., "300 pts", "1000 pts").
2. **Given** a promo card with a point price button, **When** the user hovers over the button on desktop (or focuses it), **Then** the button text transitions to "Claim".
3. **Given** an eligible promo card, **When** the user activates "Claim", **Then** the required points are deducted from the user's balance, a confirmation is displayed, and the newly claimed reward appears immediately in "Your Promos (Claimed)".
4. **Given** a promotion requiring a tier higher than the user's current tier (e.g., Platinum tier requirement for a Gold member), **When** viewing the card, **Then** the action button is disabled and clearly displays "LACKS TIER".
5. **Given** a promotion within the user's tier but requiring more points than the user's available balance, **When** viewing the card, **Then** the action button is disabled and clearly displays "INSUFFICIENT PTS".

---

### User Story 2 - Manage and Redeem Claimed Promos in Booking (Priority: P2)

As an authenticated customer who has claimed promo vouchers, I want to see all my active claimed rewards with expiration dates and launch a direct booking action so that I can readily apply my vouchers during a reservation.

**Why this priority**: Claimed vouchers deliver value only when redeemed. Providing immediate visibility and a direct bridge ("USE NOW") to the booking flow ensures high completion rates.

**Independent Test**: Can be tested by viewing the "Your Promos (Claimed)" section, selecting "USE NOW" on an active voucher (e.g. "10% Off Standard"), and verifying it launches the reservation modal pre-selecting the voucher perk.

**Acceptance Scenarios**:

1. **Given** a user with claimed rewards, **When** they view the "Your Promos (Claimed)" section, **Then** they see cards for each claimed reward displaying promotion title, validity/expiry date (e.g., "Valid till: Oct 30"), and a "USE NOW" action button.
2. **Given** a claimed promo card, **When** the user clicks "USE NOW", **Then** the system opens the booking modal with the appropriate perk/discount pre-selected.
3. **Given** a user with zero claimed rewards, **When** viewing the page, **Then** the "Your Promos" section displays a friendly empty state encouraging the user to claim available tier rewards below.

---

### User Story 3 - Discover Global Active Promotions (Priority: P3)

As any visitor or customer, I want to see system-wide active promotional campaigns and seasonal discounts in a prominent banner area so that I am aware of ongoing business specials regardless of loyalty point redemption.

**Why this priority**: Global promotions drive awareness for universal seasonal campaigns (e.g., Summer Splash, weekend specials) that do not require points redemption.

**Independent Test**: Can be tested by loading the Promo page and verifying the top banner carousel renders active system-wide campaigns with descriptions and discount details.

**Acceptance Scenarios**:

1. **Given** active system-wide campaigns, **When** navigating to the Promo page, **Then** a prominent banner/carousel section at the top displays global active promotions (e.g., "Summer Splash: 20% Off All Washes", "Free Tire Shine Weekend").
2. **Given** multiple global campaigns, **When** interacting with navigation controls (arrows/indicators), **Then** the carousel allows scrolling through all active global campaigns.

---

### Edge Cases

- **Unauthenticated Visitor**: When a guest visits the Promo page without signing in, the page displays global active promotions, prompts sign-in to view personalized point balance and claimed vouchers, and disables claim actions with a "Sign In to Claim" prompt.
- **Exact Point Balance Match**: When a user with 300 points claims a 300-point reward, balance drops to 0, and all other point-required buttons immediately update to disabled "INSUFFICIENT PTS" states without requiring a page reload.
- **Concurrent/Repeated Claim**: Rapid duplicate clicks on a "Claim" button must be debounced/disabled to prevent duplicate redemptions or negative point balances.
- **Expired Global or Claimed Promotions**: Claimed vouchers past their expiry date are either marked as expired or moved to an archived/expired tab/section and cannot trigger "USE NOW".
- **Network Failure During Claim**: If the claim transaction encounters a network or server error, the point balance remains unchanged and a clear error notification informs the user to retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a global active promotions section at the top of the Promo page showcasing sitewide active marketing campaigns.
- **FR-002**: System MUST display the authenticated customer's current loyalty tier name and real-time available points balance in the page header and tier section.
- **FR-003**: System MUST provide a dedicated "Your Promos (Claimed)" section displaying all promotional vouchers currently held by the authenticated user.
- **FR-004**: Each claimed promo card MUST display the reward title, expiration date, and a prominent "USE NOW" action.
- **FR-005**: Activating "USE NOW" on a claimed promo MUST launch the reservation/booking workflow with the promo perk linked.
- **FR-006**: System MUST organize claimable promotions into clear tier categories (e.g., "Silver Tier & Above", "Gold Tier & Above", "Platinum Tier").
- **FR-007**: Each claimable promo card MUST display the promo name/perk, description, required tier, and point cost.
- **FR-008**: The action button on an eligible promo card MUST display its point cost (e.g., "300 pts") in default state, and transition text to "Claim" on hover/focus.
- **FR-009**: When a user's loyalty tier is below the promotion's required tier, the action button MUST be disabled with the label "LACKS TIER".
- **FR-010**: When a user meets the tier requirement but has fewer points than the promotion's point cost, the action button MUST be disabled with the label "INSUFFICIENT PTS".
- **FR-011**: Successful claiming of a promo MUST deduct the required points from the user's balance and append the voucher to "Your Promos (Claimed)" without full page reload.
- **FR-012**: System MUST render empty-state guidance when the user has no claimed promos or when a tier category has no active promotions.

### Key Entities

- **`GlobalPromotion`**: Represents a system-wide marketing campaign. Attributes: `id`, `name`, `description`, `discountPercentage` or offer details, `startDate`, `endDate`, `isActive`.
- **`ClaimableRewardOffer`**: Represents a redeemable catalog perk. Attributes: `id`, `title`, `description`, `pointsRequired`, `eligibleTiers`, `vehicleTypes`.
- **`ClaimedPromoVoucher`**: Represents an active reward voucher claimed by a user. Attributes: `id`, `customerId`, `rewardOfferId`, `title`, `claimedDate`, `expiryDate`, `status` (`ACTIVE` | `USED` | `EXPIRED`), `appliedPerk`.
- **`LoyaltyProfile`**: Contextual customer data. Attributes: `customerId`, `phone`, `currentTier`, `pointsBalance`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated customers can claim an eligible reward in under 3 seconds from button click to balance update and voucher display.
- **SC-002**: 100% of promo cards accurately reflect eligibility state ("Claim", "LACKS TIER", "INSUFFICIENT PTS") based on real-time user tier and point balance.
- **SC-003**: 100% of "USE NOW" clicks on claimed promos open the booking flow with the appropriate promotion context.
- **SC-004**: Users report high clarity regarding point costs and tier barriers with zero ambiguity on why a promo is locked or disabled.
- **SC-005**: Zero duplicate redemptions or negative point balances occur under rapid clicking or transient latency.

## Assumptions

- Users navigate to the Promo page from the top navigation bar where the "Promo" tab is highlighted.
- The existing customer loyalty service and demo data provide customer tier, points balance, and reward catalog definitions.
- The booking modal supports receiving a pre-selected perk or promotion discount when launched via "USE NOW".
- All dates for expiry and validity are displayed in localized, user-friendly date formats (e.g., "MMM DD" or "YYYY-MM-DD").
