# Tasks: Customer & Admin Loyalty Flow

**Input**: Design documents from `/specs/003-customer-admin-loyalty-flow/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Audit existing backend routes and service modules in `backend/src/routes/` and `backend/src/services/` to confirm they can support new loyalty, booking, admin, and promo APIs.
- [ ] T002 [P] Audit existing frontend loyalty types and service functions in `frontend/src/models/loyalty.model.ts` and `frontend/src/App.tsx` to confirm they align with the new customer and admin API contracts.
- [ ] T003 [P] Confirm `backend/src/storage.ts` and `backend/src/models/loyalty.model.ts` support the required customer, tier, booking, promotion, reward offer, and audit log entities documented in `data-model.md`.
- [ ] T004 [P] Confirm `frontend/src/services/loyalty.service.ts` currently supports the contract endpoints `POST /api/loyalty/link`, `GET /api/loyalty/dashboard`, and `POST /api/bookings` and identify any missing admin client services.
- [ ] T005 [P] Confirm `backend/src/index.ts` registers loyalty, booking, reward, and admin routes, and add or extend route registration if needed for admin audit and promotion endpoints.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Implement or complete backend request validation and error handling for customer loyalty linking, dashboard retrieval, and booking creation in `backend/src/routes/loyalty.route.ts` and related services. [FR-001..FR-011]
- [ ] T007 Implement or complete backend admin authorization and audit protection in `backend/src/routes/admin.route.ts` and supporting services. [FR-012..FR-023]
- [ ] T008 Implement or complete backend tier management in `backend/src/services/tier.service.ts` and routes in `backend/src/routes/admin.route.ts` for create/read/update/delete tiers. [FR-015..FR-017]
- [ ] T009 Implement or complete backend promotion management in `backend/src/services/promotion.service.ts` and routes in `backend/src/routes/admin.route.ts` for create/read/update/delete promotions. [FR-015..FR-016]
- [ ] T010 Implement or complete admin audit log persistence and retrieval in `backend/src/services/audit.service.ts` and routes in `backend/src/routes/admin.route.ts`. [FR-023]
- [ ] T011 Implement structured logging and backend metrics instrumentation for loyalty, booking, and admin audit flows in `backend/src/services/` and `backend/src/routes/` to satisfy constitution principle II.
- [ ] T012 Ensure `backend/src/services/loyalty.service.ts` `buildDashboard()` returns the contract shape required for `DashboardResponse` and supports tier-based reward suggestions, applied perks, active booking window, booking history, and point history. [FR-007..FR-011]
- [ ] T013 Ensure `backend/src/services/loyalty.service.ts` `createBooking()` enforces tier booking window rules, blocks out-of-window requests, and returns the next eligible booking date when blocked. [FR-005..FR-006]
- [ ] T014 Update `frontend/src/models/loyalty.model.ts` to include any missing response fields required by the admin and customer contract shapes, such as `bookingHistory`, `pointHistory`, `appliedPerks`, and `nextEligibleBookingDate`.
- [ ] T015 Add backend unit tests in `backend/tests/` for loyalty linking, dashboard building, booking window enforcement, tier lookup, promotion eligibility, admin auth, and audit log creation. [SC-007]
- [ ] T016 Add frontend unit or integration smoke tests in `frontend/` to verify the loyalty service functions can call the expected endpoints and handle errors gracefully.

---

## Phase 3: User Story 1 - Customer landing and browsing (Priority: P1) 🎯 MVP

**Goal**: Deliver the guest homepage entry point, login modal, and authenticated header navigation.

**Independent Test**: Verify guest header state, login modal launch, and authenticated nav state after login.

- [ ] T016 [US1] Implement the guest homepage header with "Keep browsing as Guest" and "Login / Sign Up" in `frontend/src/App.tsx` or a dedicated header component.
- [ ] T017 [US1] Implement the login modal trigger and flow in `frontend/src/App.tsx` or a new component, including a customer login/link experience that uses `frontend/src/services/loyalty.service.ts`.
- [ ] T018 [US1] Implement authenticated customer navigation with Home, Bookings, and Promo links after login in `frontend/src/App.tsx`.
- [ ] T019 [US1] Wire the homepage route and header navigation to customer view state in `frontend/src/App.tsx`, ensuring Home returns the customer to the loyalty dashboard and promo/bookings navigation routes update the URL or view state.
- [ ] T020 [US1] Add frontend tests in `frontend/src/` to verify the guest header, login modal opening, and authenticated header nav behavior.

---

## Phase 4: User Story 2 - Bookings modal and full bookings page (Priority: P1)

**Goal**: Deliver active bookings modal access and a full bookings page with active orders and histories.

**Independent Test**: Verify the header Bookings action opens a modal and the See more action navigates to the Bookings page with separate booking and point history sections.

- [ ] T021 [US2] Implement the Active Bookings modal and See more action in `frontend/src/components/BookingFlow/BookingFlow.tsx` and related page components.
- [ ] T022 [US2] Implement the full Bookings page in `frontend/src/pages/BookingPage.tsx` to show active bookings, booking history, and point history for the logged-in customer. [FR-007]
- [ ] T023 [US2] Ensure the Bookings page handles empty states when the customer has no bookings or no point history. [Edge Cases]
- [ ] T024 [US2] Add frontend tests for the Bookings modal and page navigation, plus empty-state handling.
- [ ] T025 [US2] Add or extend backend tests to validate booking history and point history are returned correctly from `buildDashboard()` and booking APIs.

---

## Phase 5: User Story 3 - Promo discovery and redemption (Priority: P2)

**Goal**: Deliver the Promo page with active promotions, tier-based organization, and redemption eligibility.

**Independent Test**: Verify the Promo page loads active promotions, shows tier grouping, and prevents redemption of higher-tier offers.

- [ ] T026 [US3] Implement the customer Promo page view in `frontend/src/pages/PromoPage.tsx` or similar, using current promotions and loyalty tier eligibility.
- [ ] T027 [US3] Update the customer loyalty dashboard or promo service to include tier-based active promotions and reward suggestions from `backend/src/services/reward.service.ts` and `backend/src/services/promotion.service.ts`.
- [ ] T028 [US3] Ensure the Promo page allows customers to view higher-tier offers but only redeem those available to their current tier. [FR-011]
- [ ] T029 [US3] Add frontend tests for Promo page rendering, tier eligibility display, and redemption blocking behavior.
- [ ] T030 [US3] Add backend tests for promotion eligibility and reward suggestion filtering by tier. [FR-010]

---

## Phase 6: User Story 4 - Admin login and dashboard access (Priority: P1)

**Goal**: Deliver the admin signin path and sidebar navigation to Dashboard, Promo, Tier Config, Bookings, and Users.

**Independent Test**: Verify admin login routes to the admin home page and displays the required sidebar sections.

- [ ] T031 [US4] Implement the admin login screen and authentication flow in `frontend/src/pages/AdminLoginPage.tsx` or equivalent.
- [ ] T032 [US4] Implement the admin home dashboard page with a sidebar containing Dashboard, Promo, Tier Config, Bookings, and Users in `frontend/src/pages/AdminDashboardPage.tsx`.
- [ ] T033 [US4] Implement backend admin auth guards in `backend/src/routes/admin.route.ts` and confirm the admin token is enforced for protected routes. [FR-012]
- [ ] T034 [US4] Add frontend tests for admin login flow, sidebar navigation, and required admin sections visibility. [SC-005]
- [ ] T035 [US4] Add backend tests for admin route protection and unauthorized access handling.

---

## Phase 7: User Story 5 - Admin promo and tier management (Priority: P2)

**Goal**: Deliver admin screens for CRUD of promotions and tiers.

**Independent Test**: Verify admin promo and tier pages support create/read/update/delete actions.

- [ ] T036 [US5] Implement the admin promo management UI in `frontend/src/pages/AdminPromoPage.tsx` or a dedicated component and wire it to `GET/POST/PUT/DELETE /api/admin/promotions`.
- [ ] T037 [US5] Implement the admin tier configuration UI in `frontend/src/pages/AdminTierPage.tsx` or a dedicated component and wire it to `GET/POST/PUT/DELETE /api/admin/tiers`.
- [ ] T038 [US5] Implement backend routes and service support for tier and promotion CRUD operations in `backend/src/routes/admin.route.ts`, reusing `backend/src/services/tier.service.ts` and `backend/src/services/promotion.service.ts`. [FR-015..FR-017]
- [ ] T039 [US5] Add admin UI validation for tier and promotion input fields in frontend components and ensure required fields are enforced. [Edge Cases]
- [ ] T040 [US5] Add backend tests for admin tier and promotion CRUD flows and audit log entries for create/update/delete operations. [FR-023]

---

## Phase 8: User Story 6 - Admin bookings and user management (Priority: P2)

**Goal**: Deliver admin booking management and user list views, including point adjustments and soft deactivation.

**Independent Test**: Verify admin booking filters and user records display required fields, and point adjustments preserve non-negative totals.

- [ ] T041 [US6] Implement the admin bookings page and sorting by Wait for confirm, Confirmed, and Finished/Closed in `frontend/src/pages/AdminBookingsPage.tsx` or similar. [FR-018]
- [ ] T042 [US6] Implement the admin users page in `frontend/src/pages/AdminUsersPage.tsx` showing full name, username, most active vehicle, email (if available), and points. [FR-019..FR-022]
- [ ] T043 [US6] Implement backend support for user point adjustments, soft deactivation, and most active vehicle calculation in `backend/src/services/loyalty.service.ts` and/or a new admin user service. [FR-020..FR-023]
- [ ] T044 [US6] Add backend tests for point adjustment audit log creation, non-negative balance enforcement, and user deactivation. [SC-007]
- [ ] T045 [US6] Add frontend admin tests for bookings sorting, user table display, point adjustment actions, and soft deactivation flows.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T046 [Polish] Update documentation in `specs/003-customer-admin-loyalty-flow/quickstart.md` and `README.md` with the new loyalty and admin flow commands and usage notes. [SC-006]
- [ ] T047 [Polish] Refine backend error handling and user-facing messages for invalid booking dates, unauthorized admin requests, and ineligible promo redemption. [FR-003..FR-023]
- [ ] T048 [Polish] Add frontend UX polish for empty states, loading states, and responsive behavior across the customer and admin screens.
- [ ] T049 [Polish] Validate the end-to-end customer journey from homepage guest state to promo redemption in `frontend/src/` and `backend/src/` end-to-end or integration tests.
- [ ] T050 [Polish] Confirm all contract endpoints declared in `specs/003-customer-admin-loyalty-flow/contracts/api-endpoints.md` are implemented and consistent with the backend routes and the frontend service layer.

---

## Dependencies & Execution Order

- **Phase 1 Setup** tasks can begin immediately and are parallelizable.
- **Phase 2 Foundational** tasks must complete before user story implementation begins.
- **Phase 3 and Phase 4** (customer homepage and bookings) are P1 by priority and should be delivered first.
- **Phase 5, Phase 7, and Phase 8** can proceed after the foundational phase is done, with admin flows and promo discovery following the customer MVP.
- **Phase 9 Polish** should happen after all core user stories are implemented.

## Notes

- `[P]` tasks are parallelizable if they do not share files.
- Each user story should remain independently testable.
- Ensure backend models and frontend UI state remain aligned with the documented contract and data model.
