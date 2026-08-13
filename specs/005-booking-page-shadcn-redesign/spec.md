# Feature Specification: Booking Page UI Replacement with shadcn

**Feature Branch**: `005-booking-page-shadcn-redesign`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Given the booking page detail description and UI wireframe, and the existing codebase, using shadcn as the main UI component library, enhance and overwrite the legacy booking page."

## Clarifications

### Session 2026-08-13

- Q: Should booking cancellation use the existing signed-in customer identity represented by the customer's phone number, or should this feature introduce a session/token-based authorization check? → A: Reuse the existing authenticated phone-based customer identity and verify booking ownership; do not introduce a new session/token system for this feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review Upcoming Bookings (Priority: P1)

An authenticated customer opens Bookings and needs an immediate, scannable view of upcoming car wash appointments. The page shows the active bookings first, with enough service, vehicle, date, and time detail for the customer to recognize each appointment.

**Why this priority**: Reviewing an upcoming appointment is the primary reason customers visit the page and prevents missed or mistaken bookings.

**Independent Test**: With an authenticated customer account containing upcoming bookings, open Bookings and verify that between three and five active booking cards are shown first, or that an appropriate empty state is shown when none exist.

**Acceptance Scenarios**:

1. **Given** an authenticated customer has active or upcoming bookings, **When** the customer opens Bookings, **Then** the page displays a section titled "My Active Bookings" with up to five booking cards ordered by scheduled date and time.
2. **Given** an active booking card is displayed, **When** the customer reviews it, **Then** the card shows the service, scheduled date, scheduled time, vehicle model, and vehicle identifier.
3. **Given** the customer has no active bookings, **When** the customer opens Bookings, **Then** the active section displays a clear empty state and a path back to making a booking.

---

### User Story 2 - Cancel an Appointment with Clear Consequences (Priority: P1)

An authenticated customer needs to cancel an upcoming appointment directly from its card. The page explains whether the cancellation is within the four-hour threshold and makes a late-cancellation warning visible without blocking the cancellation.

**Why this priority**: Customers need control over appointments, while the business needs transparent enforcement of the late-cancellation policy.

**Independent Test**: Use one booking scheduled more than four hours away and one scheduled within four hours; cancel both and verify the confirmation, resulting status, and warning behavior independently.

**Acceptance Scenarios**:

1. **Given** an active booking is more than four hours before its scheduled time, **When** the customer selects Cancel Booking and confirms, **Then** the booking is cancelled without a late-cancellation warning.
2. **Given** an active booking is within four hours of its scheduled time, **When** the customer selects Cancel Booking and confirms, **Then** the booking is cancelled and a prominent warning identifies the late cancellation.
3. **Given** a customer has accumulated three late-cancellation warnings, **When** the third warning is recorded, **Then** the customer is marked "LOW PRIORITIED" and the page communicates that status in the customer-facing account context.
4. **Given** a cancellation request cannot be completed, **When** the failure is returned, **Then** the booking remains active and the customer sees an actionable error without losing the rest of the page state.

---

### User Story 3 - Expand and Navigate Booking History (Priority: P1)

An authenticated customer wants to inspect completed and cancelled services after reviewing upcoming appointments. Selecting See All expands the page to show a historical bookings table with consistent columns and pagination.

**Why this priority**: History supports loyalty-point review, dispute resolution, and confidence that past services were recorded correctly.

**Independent Test**: Use an account with more records than one page, select See All, change the page size, and navigate forward and backward while verifying table content and controls.

**Acceptance Scenarios**:

1. **Given** the customer is viewing active bookings, **When** the customer selects See All, **Then** a section titled "Historical Bookings Table" is revealed below the active section.
2. **Given** the history section is visible, **When** the customer scans a row, **Then** the row contains ID, date, time, services, status, and points columns.
3. **Given** history contains more records than the selected page size, **When** the customer selects Next or Previous, **Then** the table changes to the corresponding page and the current page indicator updates.
4. **Given** the customer changes the items-per-page value, **When** the selection is applied, **Then** the table displays the new number of records where available and pagination recalculates from the first page.
5. **Given** history has no records, **When** the customer expands See All, **Then** the table area displays an empty state instead of a blank or broken table.

---

### User Story 4 - Use the Authenticated Booking Experience Across Devices (Priority: P2)

An authenticated customer uses the global header and footer to orient themselves on desktop or mobile. The booking page should preserve the established navigation while making the active Bookings location obvious and keeping booking actions usable on narrow screens.

**Why this priority**: The page is part of a larger customer journey; consistent navigation and responsive behavior reduce confusion and failed actions.

**Independent Test**: Open the page at desktop, tablet, and mobile widths, then navigate using the header and interact with a cancel action and pagination controls without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** an authenticated customer is on Bookings, **When** the global header renders, **Then** it includes Home, the active Bookings tab, Promo, the customer's username, and avatar treatment.
2. **Given** the customer uses a mobile viewport, **When** the page renders, **Then** content remains readable without horizontal scrolling and all primary controls remain reachable and usable.
3. **Given** the customer reaches the end of the page, **When** the footer renders, **Then** the standard global footer is present and visually consistent with the rest of the application.

### Edge Cases

- A booking scheduled exactly four hours from the current time is treated as a late cancellation and receives a warning.
- A scheduled time that has already passed is not shown as an active booking, even if its stored status is not yet updated.
- Active booking data contains more than five records; only the five nearest upcoming records appear in the primary section while the complete set remains available through history.
- Service, vehicle, points, or date fields are missing; the page uses a clear fallback value and does not collapse the card or table layout.
- A cancellation is submitted more than once or the booking is already cancelled; the customer sees the current booking state and no duplicate warning is recorded.
- Booking data is loading or unavailable; the page shows loading placeholders or an actionable error state rather than an empty success state.
- A customer changes page size while on a later history page; the page returns to a valid page and keeps the table controls synchronized.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The booking page MUST be available only within the authenticated customer experience and MUST preserve the existing global header and footer.
- **FR-002**: The page MUST display a primary section titled "My Active Bookings" before the history section.
- **FR-003**: The active section MUST display no more than five upcoming bookings, ordered by scheduled date and time, and each card MUST show service, date, time, vehicle model, and vehicle identifier.
- **FR-004**: Each cancellable active booking MUST provide a Cancel Booking action that requests confirmation before changing the booking status; the cancellation operation MUST reuse the existing authenticated phone identity and verify that the booking belongs to that customer before mutation.
- **FR-005**: A cancellation performed more than four hours before the scheduled time MUST complete without a late-cancellation warning.
- **FR-006**: A cancellation performed at or within four hours before the scheduled time MUST remain permitted, MUST display a prominent warning, and MUST record one late-cancellation warning for the customer.
- **FR-007**: After a customer's third recorded late-cancellation warning, the customer MUST be marked "LOW PRIORITIED" and that status MUST be represented in the customer-facing booking experience.
- **FR-008**: The page MUST provide a See All control that expands and collapses the complete booking history without navigating away from the page.
- **FR-009**: The expanded history section MUST be titled "Historical Bookings Table" and MUST provide columns for ID, date, time, services, status, and points.
- **FR-010**: The history table MUST provide Previous and Next controls, a current-page indicator, and an items-per-page selector; controls MUST be disabled when movement in that direction is unavailable.
- **FR-011**: The page MUST provide clear loading, empty, success, and failure states for booking data and cancellation actions, without discarding already-visible customer data during an action failure.
- **FR-012**: All booking cards, table controls, cancellation confirmation, warnings, and status indicators MUST use the established shadcn-based visual language and accessible interaction patterns used by the frontend.
- **FR-013**: The page MUST remain usable at mobile, tablet, and desktop widths without horizontal scrolling, clipped text, or overlapping controls; interactive targets MUST be large enough for touch use.
- **FR-014**: The page MUST expose meaningful labels and status information to keyboard and assistive-technology users, including cancellation warnings and pagination state.
- **FR-015**: The page MUST preserve existing customer booking and loyalty information outside the visual replacement, including booking identity, status, service details, and points-related data needed by the history view.

### Key Entities

- **Active Booking**: An upcoming customer appointment with an identifier, service or package, scheduled date and time, vehicle details, and current status.
- **Historical Booking**: A completed or cancelled appointment with the fields shown in the history table, including loyalty points earned or affected.
- **Cancellation Warning**: A recorded late cancellation associated with a customer and booking, including whether it contributes to the customer's warning count.
- **Customer Priority Status**: The customer's current booking-priority classification, including the normal state and the "LOW PRIORITIED" state after three warnings.
- **Booking History View**: The visible subset of historical bookings, its page size, current page, and total page count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability checks, authenticated customers can identify the next appointment's service, vehicle, date, and time within 10 seconds of the page becoming usable.
- **SC-002**: At least 95% of valid cancellation attempts produce a visible success or policy-warning outcome within 3 seconds, excluding intentional network failure tests.
- **SC-003**: 100% of tested cancellations at or within four hours display a warning and increment the warning count exactly once; cancellations more than four hours away display no late warning.
- **SC-004**: Customers can reveal history, change page size, and move between available pages in no more than four interactions for a dataset of at least 25 records.
- **SC-005**: The booking page has no horizontal scrolling or overlapping primary controls at widths from 320px through 1440px.
- **SC-006**: At least 90% of representative users can complete the primary tasks of reviewing an appointment, cancelling it, and locating a historical record without assistance.
- **SC-007**: Keyboard-only users can reach and operate every page action, and status or warning information is announced in the same task flow in 100% of accessibility checks.

## Assumptions

- The customer is authenticated before the booking page is opened; unauthenticated navigation continues to use the existing sign-in flow, and this feature reuses the existing phone-based identity rather than introducing session/token authentication.
- Existing booking and loyalty services remain the source of truth for customer data, cancellation results, warning counts, and priority status.
- The current date and time used for the four-hour policy are evaluated when the page performs or confirms a cancellation, not only when the page first loads.
- The default history page size is 10 records, with additional page-size choices provided by the product's existing table conventions.
- The booking history data can provide service, time, points, and vehicle model details, or can provide explicit fallback values when legacy records do not contain them.
- The existing shadcn/Radix foundation in the frontend is the preferred visual component source for this replacement; no new design system is required.
- Payment, rescheduling, refunds, and administrative booking management are out of scope for this customer-page replacement.

## Scope Boundaries

- In scope: customer booking-page layout, active booking cards, cancellation interaction and policy messaging, warning/priority status display, expandable booking history, pagination, responsive states, and accessibility.
- Out of scope: creating new booking appointments, changing appointment times, payment handling, admin workflows, and redesigning the global header or footer beyond the integration needed to identify the active page.