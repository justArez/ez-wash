# Feature Specification: Smart Automated Car Wash

**Feature Branch**: `001-smart-automated-car-wash`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "the requirement from @file:project_requirements.md, divide to multiple main flows"

## Clarifications

### Session 2026-08-10

- Q: Should a single customer loyalty account cover all linked vehicles and maintain one shared tier, points balance, and booking window? → A: Yes, one loyalty account is shared across all vehicles.
- Q: If a customer tries to book outside their tier window, should the system block the booking and show the next eligible booking date? → A: Yes, block the booking and show the next eligible booking date.
- Q: Should motorcycles and cars use different booking or reward rules even under the same shared loyalty account? → A: Yes, vehicle type may change booking or reward behavior.
- Q: Should selecting a car or motorcycle model automatically apply model-specific treatment rules such as booking preference or loyalty perks? → A: Yes, selecting the model should auto-apply model-specific treatment rules.
- Q: When an admin updates tier or promotion rules, should those new settings apply immediately to in-progress bookings and redemptions or only to new transactions? → A: Apply the new rules only to new bookings and redemptions created after the update.
- Q: Should promotion targeting be limited to a tier threshold such as Silver+ or be fully configurable by custom audience rules? → A: Limit promotion targeting to tier thresholds such as Silver+.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Booking & Loyalty View (Priority: P1)

A customer can browse the homepage as a guest or sign in, view loyalty points balance, see tier status, choose a vehicle model, and make an advance booking within their tier-based window. The system also personalizes reward options, automatically applies eligible tier perks at checkout, and supports navigation through Home, Bookings, and Promo.

**Why this priority**: This is the core customer-facing value: it provides convenience, loyalty visibility, personalized rewards, and checkout benefits.

**Independent Test**: A customer can complete account linking, view points and tier, select a vehicle model, and create a booking using their available window without requiring any admin actions.

**Acceptance Scenarios**:

1. **Given** a customer with a registered license plate and phone number, **when** they view their loyalty dashboard, **then** they see the current points balance, tier level, personalized reward suggestions, and next available booking window.
2. **Given** a customer in a specific tier, **when** they request a new advance booking, **then** the system allows bookings up to the tier-defined window and shows the correct priority status.
3. **Given** a customer requesting a booking outside their allowed tier window, **when** they attempt to book, **then** the system blocks the request and displays the next eligible booking date.
4. **Given** a customer with eligible tier benefits, **when** they checkout, **then** the system automatically applies the appropriate tier perks and service-level treatment.
5. **Given** a signed-in customer, **when** they open the bookings area, **then** they can view active bookings, booking history, and point history from a dedicated page or modal.
6. **Given** a signed-in customer, **when** they open the promo area, **then** they can view active promos and tier-based redeemable offers with their available points.

---

### User Story 2 - Loyalty Tier Management (Priority: P2)

An admin can sign in, access a dashboard with sidebar navigation, configure tier rules, point rates, perks, promotions, booking status views, and user accounts, and the system automatically evaluates tier upgrades and downgrades during monthly reviews.

**Why this priority**: Admin configuration is required to keep loyalty rules aligned with business goals and to ensure customers receive the correct benefits.

**Independent Test**: An admin can update tier definitions and promotions, and the system applies the new configuration to tier evaluations and customer access rules.

**Acceptance Scenarios**:

1. **Given** admin access to tier settings, **when** they update points-per-visit rates or tier windows, **then** the system saves the new values and uses them in the next tier evaluation.
2. **Given** a monthly review process, **when** the system reviews customer activity, **then** customers are automatically upgraded or downgraded based on earned points and visit counts.
3. **Given** admin access to the management area, **when** they open the bookings section, **then** they can sort bookings by waiting for confirmation, confirmed, and finished or closed statuses.
4. **Given** admin access to the user section, **when** they manage a user, **then** they can view fullname, username, most active vehicle, email, points, and add or subtract points.

---

### User Story 3 - Points Redemption & History (Priority: P3)

A customer can redeem loyalty points for discounts, free washes, or add-ons, and see their redemption history and point expiration status.

**Why this priority**: Points redemption is a visible reward that drives retention and demonstrates the loyalty program's value.

**Independent Test**: A customer redeems points successfully, sees updated balances, and can review past redemptions and expiry dates.

**Acceptance Scenarios**:

1. **Given** a customer with enough points, **when** they choose to redeem a reward, **then** the system deducts the correct number of points and confirms the redemption.
2. **Given** earned points older than 12 months, **when** the system evaluates expiration, **then** expired points are removed from the available balance and the history shows the expiry event.

---

### Edge Cases

- The system blocks bookings attempted beyond the customer's allowed tier window and shows the next eligible booking date.
- The system treats multiple linked vehicles as a single customer loyalty account with one shared tier and points balance.
- The system must handle vehicle-type-specific booking or reward rules for cars and motorcycles under the same loyalty account.
- Admin updates to tier or promotion rules apply only to new bookings and redemptions created after the update, not to already active transactions.
- Promotions are targeted to tier thresholds such as Silver+, without support for custom audience-rule targeting in this feature.
- If a booking is submitted for the same date by customers in different tiers, higher-tier customers receive earlier priority in the queue.
- If a user opens the bookings area while not logged in, the system must guide them to authenticate before accessing personal booking history.
- If a tier rule update occurs during an ongoing booking or redemption flow, the transaction uses the rules that were in effect at submission time; new rules apply only to subsequent bookings and redemptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow customers to link an account using license plate and phone number.
- **FR-002**: The system MUST present a loyalty dashboard showing points balance, tier status, and available booking window.
- **FR-003**: The system MUST allow customers to make advance bookings within the booking window defined by their membership tier.
- **FR-004**: The system MUST support automatic monthly tier evaluation for upgrades and downgrades based on points, points spend, and visit counts.
- **FR-005**: The system MUST allow admins to create, read, update, and delete tier definitions, including point earning rates, perks, and targeted promotions for tier thresholds such as Silver+.
- **FR-006**: The system MUST allow customers to redeem points for discounts, free washes, or add-ons.
- **FR-007**: The system MUST expire points after 12 months and reflect expirations in the loyalty balance and history.
- **FR-008**: The system MUST track booking and wash history for each customer and their linked vehicles.
- **FR-009**: The system MUST support tier-based booking windows: Member 7 days, Silver 10 days, Gold 12 days, Platinum 14 days.
- **FR-010**: The system MUST allow motorcycles and cars to have different booking or reward rules while sharing the same customer loyalty account.
- **FR-011**: The system MUST allow customers to select a vehicle model and automatically apply model-specific booking preference or loyalty treatment rules.
- **FR-012**: The system MUST automatically apply eligible tier perks at checkout for qualified bookings and services. For this feature, a booking receives the tier's perk set when the customer is within the allowed booking window and the perk is eligible for the booked service type; the applied perks must be visible in the booking confirmation.
- **FR-013**: The system MUST personalize reward and promotion suggestions using customer profile, loyalty tier, and vehicle model data.
- **FR-014**: The system MUST define booking priority using the customer's current tier, where higher tiers receive earlier booking priority within the same requested date window.
- **FR-015**: The system MUST enforce explicit admin authorization and audit logging for tier changes, points adjustments, and promotion updates. Each sensitive action must record actor identity, timestamp, action type, and affected entity.
- **FR-016**: The system MUST provide automated contract and end-to-end test coverage for booking, loyalty calculation, tier evaluation, redemption, and admin mutation flows before implementation is considered complete.
- **FR-017**: The system MUST support a guest-to-login experience where the landing page shows a header with Keep browsing as Guest and Login / Sign Up, and the login action opens an authentication modal.
- **FR-018**: The system MUST provide a logged-in user navigation header with Home, Bookings, and Promo, and route the Bookings action to a bookings overview with active bookings, booking history, and point history.
- **FR-019**: The system MUST provide a promo experience that shows active promotions and tier-based redeemable promos that can be redeemed using user points.
- **FR-020**: The system MUST provide an admin management experience with a sidebar for Dashboard, Promo, Tier Config, Bookings, and Users, including dashboard widgets and user point adjustment capabilities.

### Key Entities *(include if feature involves data)*

- **Customer**: Represents a vehicle owner with contact details, linked vehicles, and a single shared loyalty account that maintains the tier and points balance across all vehicles.
- **Vehicle**: Represents a customer's vehicle, identified by license plate, model, type (car or motorcycle), and associated with booking and wash history.
- **Loyalty Tier**: Represents a membership level with rules for booking windows, point rates, and perks.
- **Booking**: Represents an advance reservation for a wash slot with tier-based priority and scheduled date.
- **Promotion**: Represents a targeted offer or reward configuration applicable to eligible tiers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of customers can link their account and view loyalty details in under 3 minutes.
- **SC-002**: 95% of tier evaluations complete successfully on the scheduled monthly review.
- **SC-003**: Customers in each tier can book within their allowed window without manual intervention.
- **SC-004**: Points expiration is reflected accurately in the loyalty balance for 100% of customers with aged points.
- **SC-005**: Admins can update tier rules or promotions and see the new rules applied in the next loyalty evaluation cycle.
- **SC-006**: 100% of tier changes, points adjustments, and promotion updates are recorded in an auditable log with actor identity and timestamp.
- **SC-007**: Critical flows for booking, loyalty calculations, tier evaluation, redemption, and admin mutations are covered by automated contract or end-to-end tests before release.

## Assumptions

- Customers have a valid license plate and phone number for account linking.
- Online payment and refund workflows are intentionally excluded from this feature.
- Loyalty tier changes are evaluated on a monthly cadence rather than in real time.
- Existing customer authentication and account management are available or will be provided separately.
- The loyalty program will leverage AI and CRM capabilities to personalize rewards, promotions, and checkout treatment based on customer and vehicle profile signals.
