# Feature Specification: Admin Dashboard + Booking Modal

**Feature Branch**: `006-admin-dashboard-booking-modal`

**Created**: 2026-08-16

**Status**: Draft

**Input**: User description: "implement Admin Login -> Admin Dashboard and new Booking Modal as a new feature"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin access and dashboard navigation (Priority: P1)

A system administrator can sign in through the Admin Login page and access the Admin Dashboard to monitor operations, manage bookings, and act on service requests.

**Why this priority**: Admin access is required before any administrative business controls can be used, and the dashboard is the single place for operational oversight.

**Independent Test**: Validate that an admin can sign in with valid credentials, reach the dashboard, and navigate to each admin section with visible controls.

**Acceptance Scenarios**:

1. **Given** a user with valid admin credentials, **When** they submit the Admin Login form, **Then** they are redirected to the Admin Dashboard and `adminUserInfo` is stored in browser localStorage to preserve authorization state.
2. **Given** an admin on the dashboard, **When** they choose the Bookings tab, **Then** they see bookings sorted by state and tier with actions for confirm, complete, or cancel.
3. **Given** an admin navigating the admin area, **When** they visit `/admin`, **Then** they land on the Admin Dashboard and all other admin tabs are available under `/admin/*` routes.

---

### User Story 2 - Booking modal for logged-in customers (Priority: P1)

A logged-in customer can open a Booking Modal from an available timeslot, enter their contact and vehicle details, choose services, and confirm the booking.

**Why this priority**: A reliable booking flow is the customer-facing value that converts a selected time slot into a real appointment.

**Independent Test**: Confirm that a logged-in user can open the modal, complete required fields, see service options filtered by vehicle type, and submit a valid booking.

**Acceptance Scenarios**:

1. **Given** a logged-in customer selecting an available slot, **When** they open the Booking Modal, **Then** the modal displays Phone, Email, License Plate, Vehicle Model, Vehicle Type, service checkboxes, and total cost.
2. **Given** a selected vehicle type and chosen services, **When** a service is outside its allowed timeslot or would exceed available capacity, **Then** that service option is disabled and an explanatory warning is displayed.

---

### User Story 3 - Admin service, promo, tier, and user management (Priority: P2)

An administrator can manage service definitions, promotions, tier configurations, and customer accounts from the Admin Dashboard sections.

**Why this priority**: These controls keep the business model flexible and ensure promotions and tiers can be maintained without a developer.

**Independent Test**: Verify that admin users can open each management section, see existing entities, and perform create/update/delete actions with immediate feedback.

**Acceptance Scenarios**:

1. **Given** an admin in the Services tab, **When** they create or update a service, **Then** the service is stored with vehicle type, duration slots, and allowed timeslots.
2. **Given** an admin in the Promo tab, **When** they assign a promo to a tier and set a redemption price, **Then** the promo is linked to the selected tier and the point price is visible.
3. **Given** an admin in the Tier Config tab, **When** they create a tier set, **Then** the set contains at least two tiers and can be marked as the active tier set.
4. **Given** an admin in the Users tab, **When** they adjust a user's point balance, **Then** the updated points are recorded and displayed.

---

### Edge Cases

- Booking Modal handles a selected slot near the end of operating hours and prevents services that cannot complete before closing.
- Admin attempts to mark a booking complete before 10 minutes after the booked timeslot; the system must not allow it.
- Invalid admin credentials keep the user on the login page with a clear error message.
- A booking service selection that would exceed available consecutive slots must be blocked with a capacity warning.
- When no services are available for the selected vehicle type or timeslot, the modal should still allow the user to cancel or choose another slot.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an Admin Login page that accepts valid admin credentials and redirects authenticated users to the Admin Dashboard.
- **FR-002**: The Admin Dashboard MUST include a left rail navigation with tabs for Dashboard, Bookings, Services, Promo, Tier Config, and Users.
- **FR-003**: The Dashboard tab MUST display business statistics and monitoring widgets relevant to bookings, capacity, promotions, and tier usage.
- **FR-004**: The Bookings tab MUST display bookings grouped and sorted by state (Pending/Waiting to Confirm, Confirmed, Completed/Cancelled) and within each state by tier priority.
- **FR-005**: The Bookings tab MUST allow admins to confirm arrivals, reject or cancel bookings, and mark bookings as completed only when the booked timeslot has passed by at least 10 minutes.
- **FR-006**: The Services tab MUST allow admins to create, edit, and remove services with attributes for name, description, price, status, applicable vehicle type, duration slots, and allowed timeslots.
- **FR-007**: The Promo tab MUST allow admins to create, edit, and remove promotions, assign promotions to specific membership tiers, and define the point redemption price.
- **FR-008**: The Tier Config tab MUST allow admins to create and manage tier sets, require at least two tiers per set, and mark exactly one tier set as active.
- **FR-009**: The Users tab MUST allow admins to view customer data, including fullname, email, phone, most active vehicle, current points, and to manually adjust points.
- **FR-010**: The Booking Modal MUST allow a logged-in customer to enter phone, email, vehicle license plate, vehicle model, and vehicle type when booking a timeslot.
- **FR-011**: The Booking Modal MUST display service checklist options relevant to the selected vehicle type and show the total cost of selected services.
- **FR-012**: The Booking Modal MUST disable and warn for services that are not permitted at the selected timeslot or when available consecutive capacity is insufficient for the selected service durations.
- **FR-013**: The Booking Modal MUST only enable the Confirm Booking action after all required customer details are entered and a valid service selection is made.
- **FR-014**: The system MUST route guests who attempt to book a timeslot to a Sign In / Sign Up modal instead of showing the Booking Modal.
- **FR-015**: The admin booking list sort order MUST place low-priority customers below all other bookings within the same state.
- **FR-016**: Admin dashboard access MUST be restricted to authorized admin users and the client MUST persist admin authorization state using `adminUserInfo` in browser localStorage.
- **FR-017**: The admin dashboard route MUST be available at `/admin` and all other admin control tabs MUST use `/admin/*` route paths.

### Key Entities *(include if feature involves data)*

- **Admin**: A privileged user with access to the Admin Dashboard and management controls.
- **Booking**: A scheduled appointment with state, tier, customer, timeslot, selected services, and completion status.
- **Service**: A business offering with name, price, duration slots, applicable vehicle type, allowed timeslots, and active/inactive status.
- **Promo**: A promotion with tier assignment, point redemption price, and active status.
- **Tier Set**: A collection of tiers with thresholds and an active flag for the current application tier structure.
- **Customer Profile**: A user record with fullname, email, phone, vehicles, loyalty points, and priority status.
- **Booking Modal Data**: Temporary booking selections including customer contact, vehicle details, service choices, and total cost.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users with valid credentials can sign in and reach the Admin Dashboard successfully in at least 95% of attempts.
- **SC-002**: Admins can access Booking, Services, Promo, Tier Config, and Users sections from the dashboard within three clicks.
- **SC-003**: Logged-in customers can complete the Booking Modal flow from slot selection through confirmation in under 5 minutes.
- **SC-004**: Booking Modal service restrictions and capacity warnings are displayed for 100% of disallowed service selections.
- **SC-005**: Admins can create or update services, promotions, tier sets, and user point adjustments without requiring development support.
- **SC-006**: Booking actions for confirming arrival, canceling, and completing are available and enforced according to the defined business rules.

## Assumptions

- Admin accounts and authentication exist or will be integrated with the current application sign-in mechanism.
- The customer-facing booking schedule and available timeslot grid already exist; this feature adds the Booking Modal interaction on top of that flow.
- Bookings and user loyalty state are tracked in the existing system so admin actions update live records.
- Mobile responsive layout is expected but a dedicated mobile experience is out of scope for this feature.
- No external payment or loyalty provider integration is required for this feature.
- Admin authorization state is expected to be persisted in browser localStorage using an `adminUserInfo` key for session continuity.
- Admin pages should reuse the same layout and navigation approach as the customer homepage to ensure consistency across the application.
