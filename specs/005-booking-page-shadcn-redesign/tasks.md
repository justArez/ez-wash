# Tasks: Booking Page UI Replacement with shadcn

**Input**: Design documents from `/specs/005-booking-page-shadcn-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/booking-api.md, quickstart.md

**Tests**: Required for booking state transitions and API contracts by the project constitution. Playwright tests are intentionally omitted; manual browser validation and the existing Bun/build/lint checks cover the UI because the constitution limits AI-generated Playwright coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independently valuable increment.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing project surfaces and establish the focused test locations without adding a new framework.

- [X] T001 [P] Confirm the booking-page feature paths and existing test commands in `specs/005-booking-page-shadcn-redesign/quickstart.md`
- [X] T002 [P] Add the booking service and route test file scaffolds in `backend/tests/booking.service.test.ts` and `backend/tests/booking.route.test.ts`
- [X] T003 [P] Document the booking-page field and fallback contract in `frontend/src/models/loyalty.model.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add backward-compatible domain fields and shared dashboard mapping required by all user stories.

**Critical**: Complete this phase before implementing story-specific UI or cancellation behavior.

- [X] T004 Extend `Booking` and `LoyaltyCustomer` with optional display fields, cancellation metadata, warning count, and priority status in `backend/src/models/loyalty.model.ts`
- [X] T005 [P] Mirror the enriched booking and customer priority types in `frontend/src/models/loyalty.model.ts`
- [X] T006 Update legacy-store normalization/default handling so existing records receive safe values for warning count, priority status, status, service, time, points, and vehicle model in `backend/src/storage.ts` and `backend/src/services/loyalty.service.ts`
- [X] T007 Extend `buildDashboard` and its response typing to return enriched booking history plus `lateCancellationWarningCount` and `priorityStatus` in `backend/src/services/loyalty.service.ts`, `backend/src/routes/loyalty.route.ts`, and `frontend/src/services/loyalty.service.ts`
- [X] T008 Add shared booking display formatting and active/history filtering helpers with stable fallbacks in `frontend/src/pages/booking.page.tsx`

**Checkpoint**: Existing dashboard consumers still load, legacy records remain readable, and the frontend has the typed data needed for all story phases.

---

## Phase 3: User Story 1 - Review Upcoming Bookings (Priority: P1) MVP

**Goal**: Replace the generic active-booking list with a clear `My Active Bookings` card section showing the nearest upcoming appointments and a useful empty state.

**Independent Test**: Sign in with an account containing upcoming bookings, open Bookings, and verify that up to five future bookings are ordered by scheduled time and show service, date, time, vehicle model, and identifier; repeat with no active bookings.

### Tests for User Story 1

- [X] T009 [P] [US1] Add service-level tests for future-booking filtering, chronological ordering, five-booking limit, and legacy display fallbacks in `backend/tests/booking.service.test.ts`
- [X] T010 [P] [US1] Add dashboard route contract assertions for enriched booking fields and customer priority status in `backend/tests/booking.route.test.ts`

### Implementation for User Story 1

- [X] T011 [US1] Update the active-booking data contract and fallback rendering in `frontend/src/models/loyalty.model.ts` and `frontend/src/pages/booking.page.tsx`
- [X] T012 [US1] Replace the legacy active list with responsive booking cards, status badges, service/date/time/vehicle details, and an actionable no-active-bookings state in `frontend/src/pages/booking.page.tsx`
- [X] T013 [US1] Add booking-card, status-badge, empty-state, and loading/error presentation styles consistent with the existing shadcn/Radix visual language in `frontend/src/App.css`
- [X] T014 [US1] Preserve authenticated dashboard navigation and refresh behavior when Bookings is opened from `frontend/src/App.tsx`

**Checkpoint**: User Story 1 is independently usable as the MVP; active bookings are scannable and legacy data renders without breaking.

---

## Phase 4: User Story 2 - Cancel an Appointment with Clear Consequences (Priority: P1)

**Goal**: Allow an authenticated customer to confirm cancellation, apply the four-hour policy server-side, record late warnings exactly once, and expose `LOW PRIORITIED` after the third warning.

**Independent Test**: Cancel an owned booking more than four hours away, one exactly four hours away, one within four hours, an already-cancelled booking, and a booking owned by another customer; verify statuses, warning counts, priority transition, and errors.

### Tests for User Story 2 (write first and confirm failure before implementation)

- [X] T015 [P] [US2] Add failing unit tests for on-time cancellation, exactly-four-hour late cancellation, duplicate cancellation idempotency, third-warning priority transition, blocked booking rejection, and ownership verification in `backend/tests/booking.service.test.ts`
- [X] T016 [P] [US2] Add failing route contract tests for `POST /api/bookings/{bookingId}/cancel`, including missing phone, not-found, ownership, success, and late-warning response shapes in `backend/tests/booking.route.test.ts`

### Implementation for User Story 2

- [X] T017 [US2] Implement `cancelBooking` with current-time evaluation, exact four-hour boundary handling, ownership checks, idempotency, warning increment, priority transition, and audit event creation in `backend/src/services/loyalty.service.ts` and `backend/src/models/loyalty.model.ts`
- [X] T018 [US2] Add the authenticated ownership-checked cancel route and status-aware error responses in `backend/src/routes/booking.route.ts`
- [X] T019 [US2] Add the typed `cancelBooking` API client function for `POST /api/bookings/{bookingId}/cancel` in `frontend/src/services/loyalty.service.ts`
- [X] T020 [US2] Add confirmation-dialog state, submitting/error/success feedback, and local dashboard refresh handling for cancellation in `frontend/src/pages/booking.page.tsx`
- [X] T021 [US2] Add prominent late-cancellation warning and customer priority status treatments with accessible status announcements in `frontend/src/pages/booking.page.tsx` and `frontend/src/App.css`

**Checkpoint**: User Story 2 is independently testable through the backend contract and the authenticated page cancellation flow without altering visible data on failure.

---

## Phase 5: User Story 3 - Expand and Navigate Booking History (Priority: P1)

**Goal**: Reveal a complete historical bookings table with six required columns, page-size selection, and synchronized pagination controls.

**Independent Test**: Open See All for an account with at least 25 records, verify all columns, change page size, navigate forward/backward, and verify empty history behavior.

### Tests for User Story 3

- [X] T022 [P] [US3] Add service/contract assertions that completed and cancelled records remain in history while active cards exclude them in `backend/tests/booking.service.test.ts` and `backend/tests/booking.route.test.ts`

### Implementation for User Story 3

- [X] T023 [US3] Replace the legacy history list with the `Historical Bookings Table` and ID/date/time/services/status/points columns in `frontend/src/pages/booking.page.tsx`
- [X] T024 [US3] Add page-size selection, page reset, boundary-disabled Previous/Next controls, current-page status, and empty-history handling in `frontend/src/pages/booking.page.tsx`
- [X] T025 [US3] Add responsive table/card presentation, compact status styles, and overflow-safe layout rules for the history view in `frontend/src/App.css`
- [X] T026 [US3] Ensure successful cancellation refreshes history and preserves See All/page state where valid in `frontend/src/pages/booking.page.tsx` and `frontend/src/App.tsx`

**Checkpoint**: User Story 3 is independently usable for reviewing history and changing pagination without requiring a new server-side pagination endpoint.

---

## Phase 6: User Story 4 - Use the Authenticated Booking Experience Across Devices (Priority: P2)

**Goal**: Integrate the replacement page with the authenticated shell and make all core actions usable from mobile through desktop widths.

**Independent Test**: Review Bookings at 320px, 768px, and desktop widths; verify active navigation, no horizontal scrolling, reachable cancellation controls, readable table/cards, and the global footer.

### Tests for User Story 4

- [X] T027 [P] [US4] Add responsive and accessibility acceptance checks to the manual validation matrix in `specs/005-booking-page-shadcn-redesign/quickstart.md`

### Implementation for User Story 4

- [X] T028 [US4] Mark Bookings active in the authenticated header and preserve username/avatar treatment when rendering `frontend/src/components/header.component.tsx` and `frontend/src/App.tsx`
- [X] T029 [US4] Add keyboard labels, focus-visible states, dialog semantics, table status semantics, and touch-safe controls across `frontend/src/pages/booking.page.tsx` and `frontend/src/components/header.component.tsx`
- [X] T030 [US4] Tune booking page responsive layout, typography, spacing, and mobile table/card behavior from 320px through 1440px in `frontend/src/App.css` and `frontend/src/index.css`
- [X] T031 [US4] Verify the standard global footer remains present and visually consistent when the booking page is rendered in `frontend/src/App.tsx` and `frontend/src/components/footer.component.tsx`

**Checkpoint**: User Story 4 is independently validated across target widths and keyboard interaction paths.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Run the complete validation path and address integration regressions without expanding scope.

- [X] T032 [P] Run backend unit and route tests with `bun test` from `backend/` and resolve booking-related failures in `backend/tests/`
- [X] T033 [P] Run frontend typecheck/build with `npm run build` from `frontend/` and resolve relevant TypeScript errors in `frontend/src/`
- [X] T034 [P] Run frontend lint with `npm run lint` from `frontend/` and resolve relevant lint errors in touched files
- [X] T035 Execute the manual scenarios in `specs/005-booking-page-shadcn-redesign/quickstart.md`, including late-cancellation policy, no-horizontal-scroll checks, and keyboard navigation; document any residual gap in that guide
- [X] T036 Review cancellation audit details and customer-facing data exposure against the privacy, security, reliability, and observability requirements in `backend/src/services/loyalty.service.ts`, `backend/src/routes/booking.route.ts`, and `specs/005-booking-page-shadcn-redesign/contracts/booking-api.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; tasks can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user-story implementation because every story consumes the enriched booking/dashboard contract.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP can ship as a read-only active-booking replacement.
- **User Story 2 (Phase 4)**: Depends on Foundational and the active-card shape from US1; its backend tests can begin as soon as foundational model decisions are fixed.
- **User Story 3 (Phase 5)**: Depends on Foundational and the shared booking display helpers; can proceed after US1 helpers are available.
- **User Story 4 (Phase 6)**: Depends on the completed page interactions from US1-US3 because it validates their responsive and accessibility presentation together.
- **Polish (Phase 7)**: Depends on all desired stories being implemented.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; MVP story.
- **US2 (P1)**: Can start after Phase 2; shares booking model and active-card interaction with US1.
- **US3 (P1)**: Can start after Phase 2; shares display helpers with US1 and refresh state with US2.
- **US4 (P2)**: Follows US1-US3 for complete cross-device validation, but header/footer tasks can be developed in parallel with late US3 work.

### Parallel Opportunities

- T001-T003 can run in parallel because they touch separate documentation/test/model surfaces.
- T005 can run in parallel with T004; T006-T008 follow the model contract.
- T009-T010 can run in parallel and precede US1 implementation.
- T015-T016 can run in parallel and must be written before T017-T021.
- T022 can run in parallel with the initial US3 page work after the shared model is stable.
- T028-T031 can be split across header, accessibility, styling, and footer files after the story interaction contract is stable.
- T032-T034 can run in parallel because they are independent validation commands.

---

## Parallel Example: User Story 1

```text
Task: T009 Add service-level tests for active-booking filtering in backend/tests/booking.service.test.ts
Task: T010 Add dashboard contract assertions in backend/tests/booking.route.test.ts

After tests are in place:
Task: T011 Update frontend booking display contract in frontend/src/models/loyalty.model.ts and frontend/src/pages/booking.page.tsx
Task: T013 Add booking-card and state styles in frontend/src/App.css
```

## Parallel Example: User Story 2

```text
Task: T015 Write failing cancellation service tests in backend/tests/booking.service.test.ts
Task: T016 Write failing cancellation route tests in backend/tests/booking.route.test.ts

After the tests fail as expected:
Task: T017 Implement cancellation policy in backend/src/services/loyalty.service.ts
Task: T019 Add frontend cancellation API client in frontend/src/services/loyalty.service.ts
```

## Parallel Example: User Story 3

```text
Task: T022 Add history contract assertions in backend/tests/booking.service.test.ts and backend/tests/booking.route.test.ts
Task: T025 Add responsive history styles in frontend/src/App.css

After shared display helpers are ready:
Task: T023 Implement the history table in frontend/src/pages/booking.page.tsx
Task: T024 Implement pagination and page-size state in frontend/src/pages/booking.page.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundational data compatibility.
2. Complete Phase 3 tests and active-booking card replacement.
3. Run the US1 backend tests, frontend build, and manual active-booking scenario.
4. Stop and validate the read-only booking-page MVP before adding cancellation.

### Incremental Delivery

1. Add US1 for active booking review.
2. Add US2 for cancellation and policy enforcement.
3. Add US3 for history and pagination.
4. Add US4 for complete responsive/accessibility integration.
5. Run Phase 7 validation and document any residual gap.

### Parallel Team Strategy

1. Complete Phase 1 and Phase 2 together because the data contract blocks every story.
2. Split US1 read-only cards, US2 backend cancellation, and US3 history table once the foundational model is stable.
3. Finish US4 shell/accessibility integration after the page interactions converge.

## Notes

- Every task uses the required checklist format with a sequential ID and an exact repository path.
- `[P]` marks only tasks that can safely touch separate files or run independently.
- Tests are included because the project constitution requires automated coverage for booking business flows and API contracts.
- Playwright generation is intentionally omitted under the repository's AI-assisted test budget; quickstart manual browser checks remain required.
