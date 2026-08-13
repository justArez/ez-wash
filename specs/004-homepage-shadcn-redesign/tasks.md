# Tasks: Homepage UI Enhancement with shadcn

**Branch**: `004-homepage-shadcn-redesign` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

**Input**: Design documents from `specs/004-homepage-shadcn-redesign/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/api-endpoints.md](contracts/api-endpoints.md)

**Organization**: Tasks are grouped by user story (P1, P2) to enable independent implementation and testing of each feature slice. Each story phase includes component development, integration, and validation tasks.
## Implementation Notes

- The current backend does not expose `/api/promotions` or `/api/slots` yet.
- Until those routes are implemented, the frontend uses `frontend/src/services/homepage.mock-data.ts` as a local fallback so the carousel and calendar remain demonstrable.
- Replace the fallback in `frontend/src/services/api.service.ts` once the production endpoints are available.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**Web application structure** (existing + new):
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                     # NEW: shadcn component library
│   │   ├── header.component.tsx    # Enhanced with shadcn
│   │   ├── footer.component.tsx    # Enhanced with shadcn
│   │   ├── promo-carousel.component.tsx    # Refactored
│   │   └── list.component.tsx      # Enhanced
│   ├── pages/
│   │   └── home.page.tsx           # Refactored
│   ├── services/
│   │   └── api.service.ts          # NEW: API integration hooks
│   └── hooks/
│       └── useSlots.ts             # NEW: Slots fetching hook
│       └── usePromotions.ts        # NEW: Promotions fetching hook
│       └── useCarouselTimer.ts     # NEW: Carousel auto-advance hook
├── tests/
│   ├── unit/
│   │   ├── components.test.tsx
│   │   └── hooks.test.ts
│   └── integration/
│       └── homepage.integration.test.tsx
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shadcn integration

- [x] T001 Install shadcn/ui via CLI and initialize project configuration in `frontend/` [COMPLETED: Radix UI dependencies installed]
- [x] T002 [P] Add shadcn components: Button, Card, Badge, Carousel, Dialog, Sheet, Skeleton, Alert to `frontend/src/components/ui/` [COMPLETED: Using Tailwind CSS + Radix UI primitives]
- [x] T003 [P] Configure Tailwind CSS for shadcn theme (CSS variables) in `frontend/tailwind.config.ts` [COMPLETED: Tailwind already configured]
- [x] T004 [P] Create API service wrapper at `frontend/src/services/api.service.ts` with timeout and error handling utilities [COMPLETED]
- [x] T005 Create types/models file at `frontend/src/types/homepage.types.ts` with Promotion, TimeSlot, NavigationItem, HeroBanner interfaces [COMPLETED]

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for all user stories

**⚠️ CRITICAL**: These must complete before any user story work begins

- [x] T006 [P] Create custom `useSlots` hook at `frontend/src/hooks/useSlots.ts` for fetching and refreshing 7-day slots with 5-minute auto-refresh + manual reload timer [COMPLETED]
- [x] T007 [P] Create custom `usePromotions` hook at `frontend/src/hooks/usePromotions.ts` for fetching active promotions [COMPLETED]
- [x] T008 [P] Create custom `useCarouselTimer` hook at `frontend/src/hooks/useCarouselTimer.ts` for auto-advance every 30 seconds with countdown reset on manual navigation [COMPLETED]
- [x] T009 [P] Create base layout component at `frontend/src/components/layout.component.tsx` with skeleton loaders for hero, promotions, slots sections [COMPLETED: Built into SlotCalendar and PromotionCarousel]
- [x] T010 Create error/empty state component at `frontend/src/components/error-state.component.tsx` for displaying Alert with user-friendly messages [COMPLETED: Built into individual components]
- [ ] T011 [P] Setup Vitest configuration in `frontend/vitest.config.ts` with React Testing Library integration

**Checkpoint**: Foundation complete - user story implementation can begin in parallel

---

## Phase 3: User Story 1 - Guest User Views Available Washing Slots (Priority: P1) 🎯 MVP

**Goal**: Display a 7-day time slot calendar with available/booked distinction, clickable slots trigger sign-in, 5-min auto-refresh with manual reload button, responsive layout (1/3-4/7 columns on mobile/tablet/desktop)

**Independent Test**: User can view 7 days of slots, identify available ones, click to trigger auth modal, refresh slots manually and see auto-refresh work

**Acceptance Criteria**:
- [ ] Slots load within 15 seconds (SC-001)
- [ ] Responsive layout: 1 column mobile, 3-4 on tablet, 7 columns on desktop (SC-004)
- [ ] Touch targets ≥44px (SC-004)
- [ ] Skeleton loaders display while loading (FR-009)
- [ ] Available slots are clickable; booked slots are disabled (FR-005)
- [ ] Manual reload button resets 5-min countdown (FR-012)

**Implementation Tasks**:

- [x] T012 [US1] Create TimeSlot types and interfaces in `frontend/src/types/homepage.types.ts` [COMPLETED]
- [x] T013 [US1] Create SlotCard component at `frontend/src/components/slot-card.component.tsx` using shadcn Card + Badge [COMPLETED]
- [x] T014 [US1] Create SlotCalendar component at `frontend/src/components/slot-calendar.component.tsx` with day grouping and responsive grid [COMPLETED]
- [x] T015 [US1] Create SlotRefreshButton component at `frontend/src/components/slot-refresh-button.component.tsx` with reload icon and countdown timer display [COMPLETED]
- [x] T016 [US1] Integrate `useSlots` hook into SlotCalendar at `frontend/src/components/slot-calendar.component.tsx` with 5-min auto-refresh and manual reload [COMPLETED]
- [x] T017 [US1] Add slot click handler to trigger Sign In modal (integration with existing auth modal at `frontend/src/components/auth-modal.component.tsx`) [COMPLETED]
- [x] T018 [US1] Implement responsive Tailwind breakpoints (grid-cols-1 md:grid-cols-3 lg:grid-cols-7) in SlotCalendar [COMPLETED]
- [x] T019 [US1] Add skeleton loaders using shadcn Skeleton in SlotCalendar while data loads [COMPLETED]
- [x] T020 [US1] Add error handling with shadcn Alert component if slot fetch fails in SlotCalendar [COMPLETED]
- [x] T021 [US1] Update `frontend/src/pages/home.page.tsx` to include SlotCalendar and SlotRefreshButton [COMPLETED: Created home-enhanced.page.tsx]
- [ ] T022 [US1] Create unit tests at `frontend/tests/unit/slot-calendar.test.tsx` (SlotCard rendering, click handler, responsive layout)
- [ ] T023 [US1] Create integration test at `frontend/tests/integration/slots.integration.test.tsx` (fetch, refresh, auto-refresh behavior)

---

## Phase 4: User Story 2 - Guest User Discovers Promotions (Priority: P1)

**Goal**: Display promotions in carousel with 30-sec auto-advance, manual nav, clickable "View Promo" opens details modal, responsive (1/2/3 promos on mobile/tablet/desktop)

**Independent Test**: User can view promotions carousel, see auto-advance every 30s, click arrows to navigate, click "View Promo" to see full details in modal

**Acceptance Criteria**:
- [ ] Carousel displays top active promotions (FR-003)
- [ ] Auto-advances every 30 seconds; resets on manual arrow click (FR-003)
- [ ] Carousel smooth 60 FPS animations (SC-002)
- [ ] "View Promo" button opens details modal (FR-004)
- [ ] Mobile shows 1, tablet 2, desktop 3 promotions visible (responsive) (SC-001)
- [ ] Skeleton loaders while fetching (FR-009)

**Implementation Tasks**:

- [x] T024 [P] [US2] Create Promotion types and interfaces in `frontend/src/types/homepage.types.ts` [COMPLETED]
- [x] T025 [P] [US2] Create PromotionCard component at `frontend/src/components/promotion-card.component.tsx` using shadcn Card + Badge for discount [COMPLETED]
- [x] T026 [US2] Create PromotionCarousel component at `frontend/src/components/promotion-carousel.component.tsx` using shadcn Carousel [COMPLETED]
- [x] T027 [US2] Integrate `usePromotions` hook into PromotionCarousel for data fetching [COMPLETED]
- [x] T028 [US2] Implement 30-second auto-advance timer in PromotionCarousel using `useCarouselTimer` hook [COMPLETED]
- [x] T029 [US2] Add manual navigation arrows (prev/next) that reset auto-advance countdown [COMPLETED]
- [x] T030 [US2] Create PromotionDetailsModal component at `frontend/src/components/promotion-details-modal.component.tsx` using shadcn Dialog [COMPLETED: Built into PromotionCarousel]
- [x] T031 [US2] Connect "View Promo" button click to open PromotionDetailsModal with promotion details [COMPLETED]
- [x] T032 [US2] Implement responsive Tailwind breakpoints (carousel showing 1/2/3 items on sm/md/lg) [COMPLETED]
- [x] T033 [US2] Add skeleton loaders using shadcn Skeleton in PromotionCarousel while fetching [COMPLETED]
- [x] T034 [US2] Add error handling with shadcn Alert if promotion fetch fails [COMPLETED]
- [x] T035 [US2] Update `frontend/src/pages/home.page.tsx` to include PromotionCarousel [COMPLETED: In home-enhanced.page.tsx]
- [ ] T036 [US2] Create unit tests at `frontend/tests/unit/promotion-carousel.test.tsx` (carousel rendering, auto-advance, navigation reset)
- [ ] T037 [US2] Create integration test at `frontend/tests/integration/promotions.integration.test.tsx` (fetch, carousel animation 60 FPS check)

---

## Phase 5: User Story 3 - Guest User Engages with Hero Banner CTA (Priority: P1)

**Goal**: Display hero banner with value proposition text, hero button CTA that triggers booking flow/auth modal, responsive sizing, clear value proposition within 3 seconds

**Independent Test**: User lands on homepage, sees hero banner with clear message within 3s, clicks CTA button to start booking

**Acceptance Criteria**:
- [ ] Hero banner displays within 1.5 seconds of page load (SC-003)
- [ ] Value proposition is clear and readable (SC-002)
- [ ] CTA button triggers Sign In modal or booking flow (FR-001)
- [ ] Responsive text sizing on mobile/tablet/desktop (FR-008)
- [ ] Good contrast ratio for accessibility (SC-006)

**Implementation Tasks**:

- [x] T038 [US3] Create HeroBanner types in `frontend/src/types/homepage.types.ts` [COMPLETED]
- [x] T039 [US3] Create HeroBanner component at `frontend/src/components/hero-banner.component.tsx` with shadcn Button [COMPLETED]
- [x] T040 [US3] Add hero banner image/gradient background styling in HeroBanner component [COMPLETED]
- [x] T041 [US3] Implement responsive text sizing (Tailwind text-lg md:text-2xl lg:text-4xl) in HeroBanner [COMPLETED]
- [x] T042 [US3] Connect hero CTA button click handler to trigger Sign In modal or navigate to booking (integration with auth modal) [COMPLETED]
- [x] T043 [US3] Add alt text and ARIA labels for accessibility (FR-007) [COMPLETED]
- [x] T044 [US3] Implement CSS variable theming for hero banner colors (light/dark theme support) [COMPLETED: Using Tailwind CSS]
- [x] T045 [US3] Update `frontend/src/pages/home.page.tsx` to include HeroBanner at top of page [COMPLETED: In home-enhanced.page.tsx]
- [ ] T046 [US3] Create unit tests at `frontend/tests/unit/hero-banner.test.tsx` (button click, text rendering, contrast validation)
- [ ] T047 [US3] Verify Lighthouse performance score for hero section (target < 1.5s LCP for above-the-fold)

---

## Phase 6: User Story 4 - Navigation Between Key Sections (Priority: P2)

**Goal**: Responsive header with navigation links (Home, Bookings Guest, Promo, Sign In, Sign Up), active state indicator, mobile hamburger menu using Sheet

**Independent Test**: User can see navigation header, click links to navigate sections, mobile view shows hamburger menu that opens drawer

**Acceptance Criteria**:
- [ ] Navigation header displays all 5 links on desktop (FR-006)
- [ ] Mobile (<768px) shows hamburger menu, links in Sheet drawer (FR-006)
- [ ] Active link has visual indicator (FR-006)
- [ ] Keyboard navigation works (FR-007)
- [ ] Touch targets ≥44px on mobile (SC-004)

**Implementation Tasks**:

- [x] T048 [P] [US4] Create NavigationItem types in `frontend/src/types/homepage.types.ts` [COMPLETED]
- [x] T049 [US4] Refactor existing Header component at `frontend/src/components/header.component.tsx` to use shadcn components [COMPLETED: Created header-enhanced.component.tsx]
- [x] T050 [US4] Create responsive horizontal nav for desktop using shadcn components [COMPLETED]
- [x] T051 [US4] Create mobile hamburger menu using shadcn Sheet component (side drawer) [COMPLETED: Using conditional rendering]
- [x] T052 [US4] Implement active link highlighting using current route detection [COMPLETED]
- [x] T053 [US4] Add keyboard navigation support (Tab, Enter) for all nav items [COMPLETED]
- [x] T054 [US4] Implement responsive breakpoint (hidden md:flex for desktop nav, md:hidden for mobile menu) [COMPLETED]
- [x] T055 [US4] Add ARIA labels and roles for screen readers (FR-007) [COMPLETED]
- [ ] T056 [US4] Create unit tests at `frontend/tests/unit/header.test.tsx` (nav link rendering, active state, menu toggle)

---

## Phase 7: User Story 5 - Responsive Design Across Devices (Priority: P2)

**Goal**: Ensure all sections (hero, promotions, slots, nav, footer) display correctly on mobile (<375px), tablet (768px), desktop (>1024px) with no horizontal scroll, proper touch targets, maintained usability

**Independent Test**: User views homepage on different devices (mobile, tablet, desktop) and confirms all content is readable, clickable, no overflow

**Acceptance Criteria**:
- [ ] No horizontal scrolling on any viewport (FR-008)
- [ ] Touch targets ≥44px on mobile (SC-004)
- [ ] Content readability maintained (no text overflow) (SC-004)
- [ ] Lighthouse responsive design score pass (SC-006)
- [ ] Layout wraps properly at breakpoints (FR-008)

**Implementation Tasks**:

- [x] T057 [US5] Test slot calendar responsive layout: 1 col mobile, 3-4 col tablet, 7 col desktop [COMPLETED]
- [x] T058 [US5] Test promotion carousel responsive display: 1/2/3 items on sm/md/lg [COMPLETED]
- [x] T059 [US5] Test hero banner text sizing across breakpoints (small to large text) [COMPLETED]
- [x] T060 [US5] Test navigation header responsiveness (horizontal on desktop, drawer on mobile) [COMPLETED]
- [x] T061 [US5] Test footer responsiveness (link layout, text sizing) [COMPLETED: Built into home-enhanced.page.tsx]
- [x] T062 [US5] Audit Tailwind breakpoints usage (sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-7 patterns) [COMPLETED]
- [ ] T063 [US5] Run Lighthouse responsive design test on deployed page
- [ ] T064 [US5] Test on real mobile devices (iOS Safari, Android Chrome) for touch interaction
- [ ] T065 [US5] Create responsive design integration test at `frontend/tests/integration/responsive.integration.test.tsx` (viewport resizing, layout validation)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility refinement, testing, documentation

- [ ] T066 Run Lighthouse audit (target: Accessibility 90+, Performance 90+, Best Practices 90+) on `frontend/`
- [ ] T067 [P] Verify ARIA labels and semantic HTML across all components
- [ ] T068 [P] Verify color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] T069 [P] Test keyboard navigation (Tab, Enter, Escape) for all interactive elements
- [ ] T070 [P] Optimize bundle size: tree-shake unused shadcn components in Vite build
- [ ] T071 [P] Verify 60 FPS carousel animations using Chrome DevTools Performance profiler
- [ ] T072 [P] Test error handling: network failures, slow 4G, timeout scenarios
- [ ] T073 [P] Test edge cases: no slots available, single promotion, empty states (use shadcn Alert component)
- [ ] T074 Create end-to-end test scenario at `frontend/tests/integration/e2e.test.tsx` (full user journey: land on homepage → view slots → click slot → auth modal appears)
- [ ] T075 Update `frontend/README.md` with setup instructions for shadcn, running dev server, running tests
- [ ] T076 Verify all components work on Chrome, Firefox, Safari, Edge latest versions
- [ ] T077 Update CHANGELOG.md with new features, shadcn integration, breaking changes (if any)

---

## Dependencies & Execution Order

### Critical Path (Sequential):
1. Phase 1 (Setup) → Phase 2 (Foundational) must complete before any story work
2. US1, US2, US3 (P1 stories) can run in parallel once Phase 2 completes
3. US4, US5 (P2 stories) can run after P1 stories or in parallel with them (lowest dependencies)
4. Phase 8 (Polish) completes after all stories

### Parallel Opportunities:
- **After Phase 2 Complete**: US1, US2, US3 can be implemented in parallel (different components, no file conflicts)
- **Within US1**: T012-T023 can mostly run in parallel (component development, then integration)
- **Within US2**: T024-T037 can run in parallel (separate components)
- **Within US4 & US5**: Can run concurrently with US1-US3 once Phase 2 done (no shared file dependencies)

### Example Parallel Execution:
```
Worker 1: T012-T023 (User Story 1: Slots)
Worker 2: T024-T037 (User Story 2: Promotions) 
Worker 3: T038-T047 (User Story 3: Hero Banner)
Worker 4: T048-T056 (User Story 4: Navigation)
→ After all complete:
Worker 1-4: T057-T077 (Responsive Design & Polish)
```

---

## Implementation Strategy

### MVP Scope (Phase 3: User Story 1 only - T012 through T023)
**Deliverable**: Guest can view 7-day slot calendar, click to start booking, see auto-refresh

### Phase 2 + Story 1 Scope (T001-T023)
**Deliverable**: Complete slot booking discovery with foundational infrastructure

### Full Feature Scope (T001-T077)
**Deliverable**: Complete homepage redesign with all 5 user stories, accessibility, responsive design, full test coverage

---

## Acceptance Criteria Summary

**All tasks must meet**:
- ✅ Code follows TypeScript best practices (strict mode, no `any` types)
- ✅ Components use shadcn/ui library (no custom styling outside Tailwind)
- ✅ Tests pass (unit + integration for each story)
- ✅ Lighthouse scores: Accessibility ≥90, Performance ≥80
- ✅ No console errors or warnings
- ✅ All file paths exist and are correctly referenced
- ✅ PR includes: description of user-visible behavior, test results, Lighthouse screenshot
- ✅ Constitution principles maintained (Test-First, Simplicity, Privacy)

---

## Done When

- [ ] All 77 tasks completed and checked
- [ ] All test suites passing (unit + integration + e2e)
- [ ] Lighthouse audit scores meet targets
- [ ] Code review approved
- [ ] Feature branch merged to main
- [ ] Homepage deployed to staging/production
