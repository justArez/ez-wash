# Tasks: Smart Automated Car Wash

**Input**: Design documents from `/specs/001-smart-automated-car-wash/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Confirm the existing loyalty route/service structure in `backend/src/` and extend it for the planned booking, rewards, and admin APIs where needed.
- [ ] T002 [P] Confirm the existing frontend loyalty service module and wire it to the planned API contract in `frontend/src/services/loyalty.service.ts`.
- [ ] T003 [P] Align backend model types with the documented customer, vehicle, tier, booking, reward, and point structures in `backend/src/models/loyalty.model.ts`.
- [ ] T004 [P] Confirm frontend UI types and component props for the loyalty dashboard, booking flow, and reward history in `frontend/src/models/loyalty.model.ts`.
- [ ] T005 [P] Review the existing JSON-backed persistence helper in `backend/src/storage.ts` and ensure it supports the planned loyalty state.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Implement or complete loyalty account linking and customer profile creation in `backend/src/services/loyalty.service.ts`. [FR-001]
- [ ] T007 Implement or complete tier rules, booking window validation, and perk application logic in `backend/src/services/tier.service.ts`. [FR-003, FR-009, FR-010, FR-011, FR-014]
- [ ] T008 Implement or complete reward suggestion logic based on customer profile, tier, and vehicle model in `backend/src/services/reward.service.ts`. [FR-013, FR-019]
- [ ] T009 Register or complete loyalty, booking, rewards, and admin routes in `backend/src/routes/` and `backend/src/index.ts`. [FR-002, FR-003, FR-005, FR-006, FR-019]
- [ ] T010 Add request validation and error handling for loyalty and booking requests in the backend route layer. [FR-002, FR-003, FR-015]
- [ ] T011 Add backend tests for loyalty account linking, booking window validation, and reward suggestions in the existing backend test structure. [FR-016]
- [ ] T012 Ensure the frontend loyalty dashboard and booking components support the documented API responses and blocked-booking behavior. [FR-002, FR-003, FR-018]
- [ ] T031 Add structured logging and success/failure metrics for backend loyalty and booking routes. [Principle II]

---

## Phase 3: User Story 1 - Customer Booking & Loyalty View (Priority: P1) 🎯 MVP

**Goal**: Enable a customer to link a loyalty account, view tier and points, receive personalized rewards, and book within the allowed tier-based window with automatic checkout perks.

**Independent Test**: A customer links an account, loads the loyalty dashboard, books an eligible slot, and sees tier perks applied at checkout.

- [ ] T013 [US1] Implement or complete `POST /api/loyalty/link` in the backend loyalty route and service layer. [FR-001]
- [ ] T014 [US1] Implement or complete `GET /api/loyalty/dashboard` with tier status, points balance, next booking window, linked vehicles, recommended rewards, and available perks. [FR-002, FR-012]
- [ ] T015 [US1] Implement or complete `POST /api/bookings` with tier-window enforcement, next eligible booking date, and automatic perk application. [FR-003, FR-009, FR-012, FR-014]
- [ ] T016 [US1] Implement or complete `GET /api/rewards/suggestions` with personalization based on customer profile, loyalty tier, and vehicle model. [FR-013, FR-019]
- [ ] T017 [US1] Ensure the frontend loyalty dashboard displays points, tier, rewards suggestions, perks, and booking eligibility. [FR-002, FR-013, FR-018]
- [ ] T018 [US1] Ensure the frontend booking flow supports linked-vehicle selection, date submission, and blocked-booking feedback. [FR-003, FR-009, FR-010]
- [ ] T019 [US1] Add or extend backend integration tests for the dashboard and booking flow. [FR-016]
- [ ] T020 [US1] Add or extend frontend validation and error handling for blocked bookings outside the allowed window. [FR-003, FR-009]
- [ ] T021 [US1] Implement the guest landing experience with a header that supports Keep browsing as Guest and Login / Sign Up, and open the login modal from the header. [FR-017]
- [ ] T022 [US1] Implement the logged-in user navigation header with Home, Bookings, and Promo, and wire Bookings to a summary modal plus the bookings history page. [FR-018]
- [ ] T023 [US1] Implement the promo page with active promos and tier-based redeemable promo entries using customer points. [FR-019]

---

## Phase 4: User Story 2 - Loyalty Tier Management (Priority: P2)

**Goal**: Allow admins to configure tier rules, point earning rates, perks, and promotions, and evaluate tier upgrades/downgrades automatically.

**Independent Test**: An admin updates tier definitions or promotions and the next evaluation applies the new rules correctly.

- [ ] T028 [US2] Implement or complete the admin tier management route and service layer for creating, reading, updating, and deleting tiers. [FR-005, FR-015]
- [ ] T029 [US2] Implement or complete the admin promotion route and service layer for viewing and updating promotions. [FR-005, FR-019]
- [ ] T030 [US2] Implement or complete the monthly tier evaluation scheduler and backend evaluation logic. [FR-004, FR-016]
- [ ] T024 [US2] Ensure the frontend admin tier management UI supports tier and promotion updates. [FR-005, FR-020]
- [ ] T025 [US2] Add or extend backend integration tests for tier updates and evaluation behavior. [FR-016]
- [ ] T026 [US2] Add or extend frontend validation for tier settings and promotion input. [FR-005]
- [ ] T027 [US2] Add admin authorization and audit logging for tier changes, points adjustments, and promotion updates. [FR-015]

---

## Phase 5: User Story 3 - Points Redemption & History (Priority: P3)

**Goal**: Enable customers to redeem loyalty points for rewards, view redemption history, and track point expiration.

**Independent Test**: A customer redeems a reward, sees the balance update, and reviews redemption and expiration history.

- [ ] T033 [US3] Implement or complete reward redemption in the backend reward service and route layer.
- [ ] T034 [US3] Implement or complete point expiration processing for points older than 12 months.
- [ ] T035 [US3] Ensure the dashboard and reward history surfaces redemption and expiration events.
- [ ] T036 [US3] Ensure the frontend reward history view displays past redemptions, expiration events, and the current balance.
- [ ] T037 [US3] Add or extend backend integration tests for redemption, history, and expiration logic.
- [ ] T038 [US3] Add contract tests for booking, reward redemption, and tier evaluation flows.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T039 [Polish] Wire the loyalty experience into the app navigation and route structure. [FR-018, FR-020]
- [ ] T041 [Polish] Update the repository documentation with a note about the Smart Automated Car Wash loyalty feature.
- [ ] T042 [Polish] Validate the quickstart scenarios and update the quickstart guide with any implementation gaps.
- [ ] T043 [Polish] Refine backend error handling for invalid input, blocked bookings, and tier-rule changes during active flows. [FR-003, FR-009, FR-015]
- [ ] T044 [Polish] Implement the admin sidebar experience for Dashboard, Promo, Tier Config, Bookings, and Users, including booking status filters and user point adjustments. [FR-020]

---

## Dependencies & Execution Order

- **Phase 1 Setup** tasks are parallelizable and can start immediately.
- **Phase 2 Foundational** tasks block the user story work and must finish first.
- **Phase 3, Phase 4, and Phase 5** can proceed in priority order after the foundational phase is complete.
- **Phase 6 Polish** is for cross-cutting cleanup once the main user stories are implemented.

## Implementation Strategy

- MVP Scope: Deliver User Story 1 first, then add admin tier management and points redemption.
- Incremental Delivery: Complete Phase 1 and Phase 2, then deliver Phase 3 as the first independently testable increment.
- Validation: After Phase 3 is complete, verify the dashboard, booking window enforcement, reward personalization, and perk behavior before continuing.
