# Tasks: Admin Dashboard + Booking Modal

**Input**: Design documents from `/specs/006-admin-dashboard-booking-modal/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize frontend and backend workspace dependencies in package.json
- [ ] T002 Verify TypeScript and Bun runtime compatibility in frontend/ and backend/
- [ ] T003 [P] Confirm existing backend routes and frontend pages can be extended without new project packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T004 [P] Implement admin authorization middleware and route guards in backend/src/routes/admin.route.ts
- [ ] T005 [P] Add admin login route and authentication handler in backend/src/routes/admin.route.ts
- [ ] T006 [P] Persist `adminUserInfo` in browser localStorage on successful admin login in frontend/src/services/admin-auth.service.ts
- [ ] T007 [P] Add admin route protection in frontend/src/App.tsx to guard `/admin` and `/admin/*`
- [ ] T008 [P] Extend existing loyalty store model or service definitions for admin and booking views in backend/src/models/loyalty.model.ts
- [ ] T009 [P] Add authorization checks for admin-only operations in backend/src/services/loyalty.service.ts

---

## Phase 3: User Story 1 - Admin access and dashboard navigation (Priority: P1) 🎯 MVP

**Goal**: Allow authorized admins to sign in and navigate the admin dashboard with route structure `/admin` and `/admin/*`.

**Independent Test**: An admin can sign in, receive a stored `adminUserInfo`, and access the dashboard and admin tab routes.

### Implementation for User Story 1

- [ ] T010 [US1] Create Admin Login page in frontend/src/pages/admin/admin-login/admin-login.page.tsx
- [ ] T011 [US1] Create Admin Dashboard page in frontend/src/pages/admin/admin-dashboard/admin-dashboard.page.tsx
- [ ] T012 [US1] Implement admin route definitions in frontend/src/App.tsx
- [ ] T013 [US1] Implement routing logic in frontend/src/App.tsx so `/admin` loads the dashboard and `/admin/*` loads admin tabs
- [ ] T014 [US1] Implement the admin login form submission in frontend/src/services/admin-auth.service.ts
- [ ] T015 [US1] Add server response handling for admin login and localStorage persistence in frontend/src/services/admin-auth.service.ts
- [ ] T016 [US1] Add server-side admin redirect or guard to backend/src/routes/admin.route.ts
- [ ] T017 [US1] Add basic admin dashboard data retrieval in backend/src/routes/admin.route.ts
- [ ] T041 [US1] Add backend test coverage for admin login and dashboard route guard behavior in backend/tests/admin.route.test.ts
- [ ] T042 [US1] Add frontend route protection test for `/admin/*` in frontend/src/pages/admin/admin-login/admin-login.test.ts

---

## Phase 4: User Story 2 - Booking modal for logged-in customers (Priority: P1)

**Goal**: Enable logged-in customers to open a Booking Modal, enter booking details, select services, and confirm bookings under the existing booking schedule flow.

**Independent Test**: A logged-in customer can open the modal from a timeslot, fill required booking fields, select valid services, and confirm the booking.

### Implementation for User Story 2

- [ ] T018 [US2] Create Booking Modal component in frontend/src/components/booking-modal.tsx
- [ ] T019 [US2] Add booking modal invocation from available timeslot selection in frontend/src/pages/booking/booking.page.tsx
- [ ] T020 [US2] Implement customer booking detail fields in frontend/src/components/booking-modal.tsx
- [ ] T021 [US2] Implement service filtering and warnings by vehicle type, allowed timeslots, and capacity in frontend/src/components/booking-modal.tsx
- [ ] T022 [US2] Implement booking confirmation action in frontend/src/components/booking-modal.tsx with total cost calculation
- [ ] T023 [US2] Implement backend booking creation route in backend/src/routes/booking.route.ts
- [ ] T024 [US2] Validate booking service availability and capacity in backend/src/services/loyalty.service.ts
- [ ] T025 [US2] Ensure guests see Sign In / Sign Up modal instead of the booking modal in frontend/src/pages/booking/booking.page.tsx
- [ ] T043 [US2] Add backend test coverage for booking creation and service availability rules in backend/tests/booking.route.test.ts

---

## Phase 5: User Story 3 - Admin service, promo, tier, and user management (Priority: P2)

**Goal**: Provide admin management screens for services, promos, tier sets, and user points adjustments.

**Independent Test**: An admin can open each management tab, manage entities, and see updates reflected in the system.

### Implementation for User Story 3

- [ ] T026 [US3] Create Services management tab in frontend/src/pages/admin/admin-services/admin-services.page.tsx
- [ ] T027 [US3] Create Promo management tab in frontend/src/pages/admin/admin-promo/admin-promo.page.tsx
- [ ] T028 [US3] Create Tier Config management tab in frontend/src/pages/admin/admin-tier/admin-tier.page.tsx
- [ ] T029 [US3] Create Users management tab in frontend/src/pages/admin/admin-users/admin-users.page.tsx
- [ ] T030 [US3] Implement service CRUD backend routes in backend/src/routes/admin.route.ts
- [ ] T031 [US3] Implement promo CRUD backend routes in backend/src/routes/admin.route.ts
- [ ] T032 [US3] Implement tier set CRUD backend routes in backend/src/routes/admin.route.ts
- [ ] T033 [US3] Implement user point adjustment backend route in backend/src/routes/admin.route.ts
- [ ] T034 [US3] Display current user loyalty points and active vehicle summary in frontend/src/pages/admin/admin-users/admin-users.page.tsx
- [ ] T035 [US3] Implement admin input validation and error handling for entity management forms in frontend/src/pages/admin/admin-services/admin-services.page.tsx and frontend/src/pages/admin/admin-promo/admin-promo.page.tsx

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 [P] Add admin authorization token refresh or session check when loading `/admin/*` in frontend/src/App.tsx
- [ ] T037 [P] Add consistent error display and warnings for admin operations and booking modal failures in frontend/src/components/*
- [ ] T038 [P] Add route fallback handling for `/admin/*` and unauthorized access in frontend/src/App.tsx
- [ ] T039 [P] Add remaining data model and contract alignment checks in data-model.md and contracts/api-endpoints.md
- [ ] T040 [P] Add structured logging and metrics for admin operations and the booking flow in backend/src/services/loyalty.service.ts and backend/src/routes/admin.route.ts
- [ ] T044 [P] Run quickstart validation scenarios from quickstart.md manually and record findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel if capacity allows
- Different user stories can be worked on in parallel by different team members
- Tasks within the same story that touch different files or routes/components may also be parallelized

---

## Parallel Example: User Story 1

```bash
# Launch all user story 1 frontend and backend tasks together where independent
Task: "Create Admin Login page in frontend/src/pages/admin/admin-login/admin-login.page.tsx"
Task: "Implement admin route definitions in frontend/src/App.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently
5. Continue with User Story 2 and User Story 3 as needed

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundation is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3

---

## Notes

- Use exact file paths for each task
- Keep user stories independent and testable
- Avoid vague tasks and cross-story dependencies
- Stop at checkpoints to validate independently
