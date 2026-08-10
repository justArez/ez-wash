# Feature Specification: Customer & Admin Loyalty Flow

**Feature Branch**: `003-customer-admin-loyalty-flow`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "new feature to enhance this repo following this design, and @file:user_admin_flow_requirements.md For Customer Landing page/ homepage (include header that said Keep browsing as Guest or Login/ Sign up), open Login modal if clicked (if logged in) header have Home, Bookings, Promo Click Home -> to Homepage Click Booking -> open Active bookings model, has See more to go Bookings page, this page need to show active bookings and booking (and point) history Click Promo -> go to Promo page, show current active promo and promo list that can be redeemed by User point, Promo redemption can be divided by Tier For Admin Admin Page: Admin Login -> Admin Home with sidebar for Dashboard, Promo, Tier Config, Bookings, Users Click Dashboard -> to admin home dashboard showing widgets of business things Click Promo -> view active promo, CRUD global promo, CRUD redeemable promo Click Tier -> CRUD Tier Click Bookings -> To Booking and view active bookings, sort by Wait for confirm -> Confirmed -> Finished/ Closed Click Users -> To User list, can CRUD User, only show User fullname, username, most active vehicle, email (if any), points, have ability to add or substract user point"

## Clarifications

### Session 2026-08-10

- Q: Should admin adjustments to customer loyalty points be recorded with an audit trail entry for every change? → A: Yes, record an audit entry for every point adjustment.
- Q: Should customers only be able to redeem promotions available to their current loyalty tier, or should they also be able to view higher-tier offers without redeeming them? → A: Customers can view higher-tier offers but only redeem current-tier offers.
- Q: Should a user's "most active vehicle" be defined by booking count, by last used vehicle, or by total usage value? → A: Most active vehicle is the one with the highest booking count.
- Q: Should deleting a user record in the admin UI permanently remove the customer profile, or should it only deactivate the user while preserving the record? → A: Deactivate the user while preserving the record and history.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer landing and browsing (Priority: P1)

A guest arrives on the homepage and sees a header with guest prompts. The guest can choose to continue browsing, open the login modal, or access the customer loyalty experience after signing in.

**Why this priority**: This is the customer entry point for loyalty and booking actions, and it establishes the primary navigation behavior.

**Independent Test**: Verify the homepage header shows guest state, opens the login modal when clicked, and changes to authenticated navigation after login.

**Acceptance Scenarios**:

1. **Given** a guest user on the homepage, **When** they view the header, **Then** they see "Keep browsing as Guest" and "Login / Sign Up".
2. **Given** the guest clicks "Login / Sign Up", **When** the action completes, **Then** a login modal appears.
3. **Given** a logged-in customer, **When** they view the header, **Then** they see navigation items: Home, Bookings, Promo.

---

### User Story 2 - Bookings modal and full bookings page (Priority: P1)

A logged-in customer can open the active bookings modal from the header and navigate to the full bookings page to review active bookings, booking history, and point history.

**Why this priority**: Booking visibility and history are core customer loyalty tasks and influence repeat usage.

**Independent Test**: Verify the bookings modal opens from the header, includes a See more action, and the bookings page displays active bookings plus history.

**Acceptance Scenarios**:

1. **Given** a logged-in customer, **When** they click Bookings, **Then** an Active Bookings modal opens.
2. **Given** the modal is open, **When** they click See more, **Then** they are taken to the Bookings page.
3. **Given** the Bookings page is displayed, **When** the page loads, **Then** it shows active bookings and separate sections for booking history and point history.

---

### User Story 3 - Promo discovery and redemption (Priority: P2)

A logged-in customer can navigate to the Promo page to view current active promotions and redeem offers based on their points and tier.

**Why this priority**: Promotion redemption supports loyalty engagement and rewards customers appropriately by tier.

**Independent Test**: Verify the Promo page shows active promotions, redeemable offers, and tier-based redemption organization.

**Acceptance Scenarios**:

1. **Given** a logged-in customer, **When** they click Promo, **Then** they are taken to the Promo page.
2. **Given** the Promo page is displayed, **When** the customer views offers, **Then** active promotions are listed.
3. **Given** active offers are visible, **When** redemption options exist, **Then** offers are grouped or divided by tier to show eligibility clearly.

---

### User Story 4 - Admin login and dashboard access (Priority: P1)

An admin signs in through the admin login flow and lands on an admin home page with a sidebar containing dashboard, promo, tier config, bookings, and users.

**Why this priority**: Admin access is required before any management tasks and gives the team visibility into business operations.

**Independent Test**: Verify admin login flow navigates to the admin home and the sidebar contains the required sections.

**Acceptance Scenarios**:

1. **Given** an admin user on the admin login screen, **When** they complete login, **Then** they are taken to the Admin Home page.
2. **Given** the admin home page is displayed, **When** the sidebar is visible, **Then** it includes Dashboard, Promo, Tier Config, Bookings, and Users.

---

### User Story 5 - Admin promo and tier management (Priority: P2)

An admin can manage global and redeemable promotions and configure loyalty tiers from the admin interface.

**Why this priority**: Promo and tier management enable admins to control loyalty offerings and membership benefits.

**Independent Test**: Verify promo and tier configuration screens allow create, read, update, and delete actions.

**Acceptance Scenarios**:

1. **Given** the admin clicks Promo, **When** the promo screen opens, **Then** active promotions are listed and CRUD actions are available for global and redeemable promos.
2. **Given** the admin clicks Tier Config, **When** the tier screen opens, **Then** tier records are listed and CRUD actions are available.

---

### User Story 6 - Admin bookings and user management (Priority: P2)

An admin can review booking statuses and manage users, including adjusting loyalty points.

**Why this priority**: Booking status control and user point adjustments support operational management and loyalty correctness.

**Independent Test**: Verify booking status sorting and user record fields, plus point adjustments.

**Acceptance Scenarios**:

1. **Given** the admin clicks Bookings, **When** the bookings screen opens, **Then** active bookings are visible and sortable by Wait for confirm, Confirmed, Finished/Closed.
2. **Given** the admin clicks Users, **When** the users screen opens, **Then** it shows rows with full name, username, most active vehicle, email if available, and points.
3. **Given** a user record is displayed, **When** the admin adjusts points, **Then** they can add or subtract user points.

---

### Edge Cases

- Guest users open the homepage without signing in and must still see the guest header state.
- Logged-in customers with no bookings must see an empty-state message on the Bookings page and still access point history.
- Promo pages must handle customers with no eligible tier offers gracefully.
- Admin views must handle no data state for promos, tiers, bookings, and users without breaking navigation.
- Point adjustment attempts that would set user points below zero should be prevented with a clear message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a homepage header for guests showing "Keep browsing as Guest" and "Login / Sign Up".
- **FR-002**: The system MUST open a login modal when a guest clicks "Login / Sign Up" from the homepage header.
- **FR-003**: The system MUST display authenticated header navigation with Home, Bookings, and Promo for logged-in customers.
- **FR-004**: The system MUST navigate to the homepage when a logged-in customer clicks Home.
- **FR-005**: The system MUST display an Active Bookings modal when a logged-in customer clicks Bookings from the header.
- **FR-006**: The system MUST provide a See more action in the Active Bookings modal that navigates to the full Bookings page.
- **FR-007**: The Bookings page MUST show active bookings and separate sections for booking history and point history, with point history clearly visible to the logged-in customer.
- **FR-008**: The system MUST navigate to the Promo page when a logged-in customer clicks Promo from the header.
- **FR-009**: The Promo page MUST show current active promotions and a promo list that customers can redeem with points.
- **FR-010**: The Promo page MUST organize redemption offers by tier or display tier-based sections for eligible customers.
- **FR-011**: The Promo page MUST allow customers to view higher-tier offers but restrict redemption to promotions available to their current tier.
- **FR-012**: The system MUST provide an admin login path that leads to an Admin Home page after successful authentication.
- **FR-013**: The admin interface MUST include a sidebar with Dashboard, Promo, Tier Config, Bookings, and Users.
- **FR-014**: The dashboard MUST display business-oriented widgets such as active bookings, promo activity, tier distribution, and loyalty engagement.
- **FR-015**: The admin promo management screen MUST allow admins to view active promotions and create, read, update, and delete global promotions.
- **FR-016**: The admin promo management screen MUST allow admins to create, read, update, and delete redeemable promotions.
- **FR-017**: The admin tier configuration screen MUST allow admins to create, read, update, and delete loyalty tiers.
- **FR-018**: The admin bookings management screen MUST display bookings and allow sorting by Wait for confirm, Confirmed, and Finished/Closed.
- **FR-019**: The admin users screen MUST list users with full name, username, most active vehicle, email if available, and points.
- **FR-020**: The system MUST define a user's most active vehicle as the vehicle with the highest booking count.
- **FR-021**: The admin users screen MUST allow admins to add or subtract loyalty points for each user.
- **FR-022**: The admin users screen MUST allow create, read, update, and deactivate user records while preserving historical profile data.
- **FR-023**: The system MUST record an audit entry for every admin loyalty point adjustment.

### Key Entities *(include if feature involves data)*

- **Customer**: A logged-in user who can view homepage navigation, active bookings, booking history, point history, and redeem promotions.
- **Booking**: A record of a customer booking with a status such as active, waiting for confirmation, confirmed, or finished/closed.
- **Promotion**: A loyalty offer that can be active globally or redeemable by customers and may be organized by tier.
- **Tier**: A loyalty membership level that determines which promotions and redemption offers are available to a customer.
- **Admin**: A staff user with access to the admin home, dashboard, promo management, tier configuration, booking management, and user management.
- **User Record**: A managed customer profile in the admin area including name, username, most active vehicle, email, and loyalty points.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of customers can navigate from the homepage to the Promo page or Bookings page in two clicks or fewer.
- **SC-002**: 90% of guest users can open the login modal successfully from the homepage header.
- **SC-003**: 90% of customers with bookings see active booking details and history on the Bookings page without requiring additional navigation.
- **SC-004**: 90% of customers can identify tier-specific promo offers on the Promo page within 5 seconds of page load.
- **SC-005**: 100% of admin users can access the required sidebar sections and reach Dashboard, Promo, Tier Config, Bookings, and Users from the Admin Home page.
- **SC-006**: 100% of admin promo, tier, booking, and user screens display a usable empty-state message when no records exist.
- **SC-007**: Admins can successfully adjust customer point balances and preserve non-negative point totals in all test cases.

## Assumptions

- Customers and admins use the same web interface but separate authentication paths for customer and admin access.
- The homepage and customer loyalty flows are implemented before or alongside the new admin management screens.
- Existing user accounts can be authenticated through the current login system, and admin credentials are available for the admin path.
- Point history and booking history data are available from existing backend systems or services.
- Promo redemption eligibility may be determined by customer tier and available points; users should see offers matched to their tier.
