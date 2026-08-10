# Feature Specification: Admin Functions

**Feature Branch**: `002-admin-functions`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "specify new feature for admin functions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure loyalty tiers and booking rules (Priority: P1)

An admin user can define and update loyalty tier rules, including tier names, point thresholds, booking window lengths, and tier perks.

**Why this priority**: Admin configuration is the foundation for the loyalty program and must exist before customers can receive accurate tier benefits.

**Independent Test**: Verify an admin can open the configuration interface, save a new tier definition, and confirm the updated tier values are stored and visible in the admin view.

**Acceptance Scenarios**:

1. **Given** an admin is signed in, **When** they navigate to the tier configuration page and save a new tier rule, **Then** the system records the tier name, required points, booking window, and perks.
2. **Given** an existing tier is configured, **When** the admin updates its booking window or perks, **Then** the new settings are saved and reflected in the loyalty program rules.

---

### User Story 2 - Manage point rates and expiration policies (Priority: P2)

An admin user can set earning rates and point expiration behavior for the loyalty program so the reward engine remains flexible and fair.

**Why this priority**: Points are the central currency of the loyalty program, and administrators need control over earning and expiry policies to manage promotions and retention.

**Independent Test**: Verify an admin can change the points earning rate or expiry setting, save it successfully, and see the updated policy description in the admin interface.

**Acceptance Scenarios**:

1. **Given** an admin is on the loyalty configuration page, **When** they set a points-per-wash rate and point expiration interval, **Then** the system saves those values and displays them in the admin control panel.

---

### User Story 3 - Create targeted promotions for membership segments (Priority: P3)

An admin user can create, schedule, and apply promotions to selected loyalty tiers or customer segments.

**Why this priority**: Targeted promotions are a key retention mechanism and let admins drive behavior for higher-value loyalty tiers.

**Independent Test**: Verify an admin can create a promotion, assign it to Silver+ members, and confirm it appears in the promotion list for the correct segment.

**Acceptance Scenarios**:

1. **Given** an admin is creating a new promotion, **When** they select target tiers and save the promotion, **Then** the promotion is listed as active for those tiers only.
2. **Given** a promotion is active, **When** the admin views the promotion report, **Then** it shows the targeted tier selection and active state.

---

### Edge Cases

- What happens when an admin enters a tier booking window that overlaps or conflicts with existing tiers?
- How does the system handle a promotion that targets no tiers or an invalid segment?
- How does the admin interface respond if required configuration fields are left empty?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin users MUST be able to create and update loyalty tier definitions, including tier name, required point threshold, booking window length, and tier-specific perks.
- **FR-002**: Admin users MUST be able to configure points earning rates and point expiration behavior for the loyalty program.
- **FR-003**: Admin users MUST be able to define targeted promotions and assign them to one or more loyalty tiers or customer segments.
- **FR-004**: The system MUST store and display active tier and promotion configurations in the admin control panel.
- **FR-005**: The system MUST allow admin users to activate, deactivate, or archive promotions without deleting their history.
- **FR-006**: Admin changes to tier rules, point policies, or promotions MUST be preserved and usable by the loyalty engine for customer-facing reward calculations.
- **FR-007**: The admin feature MUST exclude online payment and refund management from its scope.

### Key Entities *(include if feature involves data)*

- **Admin**: Represents the authenticated operator managing loyalty and promotion settings.
- **Loyalty Tier**: A loyalty segment definition with a name, point threshold, booking window duration, and perks.
- **Points Policy**: Defines how points are earned and when they expire.
- **Promotion**: A targeted offer or campaign assigned to loyalty tiers or customer segments, including active state and scheduling.
- **Audit Entry**: A record of admin configuration changes and management actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can create or update a loyalty tier configuration in three or fewer steps and confirm the change immediately.
- **SC-002**: Admin users can configure a points earning rate and point expiration policy and see the updated policy reflected in the admin control panel.
- **SC-003**: Admin users can create a targeted promotion and assign it to the intended loyalty tiers with no more than one correction needed in 95% of trials.
- **SC-004**: Admin users can activate or deactivate promotions and confirm the active state in the promotion list without losing promotion history.

## Assumptions

- Admin users already have a sign-in and authorization system that controls access to these configuration screens.
- Existing customer and loyalty data models are available for the admin feature to reference, but customer-facing behavior is handled by the loyalty engine separately.
- Online payment processing and refund management are out of scope for this feature.
- Tier and promotion configuration is managed through the existing admin interface rather than a separate external tool.
