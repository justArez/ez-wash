# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Enhance the EzWash homepage UI to provide a modern, accessible, and responsive experience using shadcn/ui components. The redesign focuses on improving the visual hierarchy, component accessibility, and user engagement across three key sections: Hero Banner (value proposition CTA), Promotions Carousel (discoverability), and 7-day Slot Calendar (booking availability). All components must be built with shadcn, Tailwind CSS, and maintain consistency with the existing design system.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 6.0.2 with React 19.2.8

**Primary Dependencies**: React 19, Tailwind CSS 4.3.3, Vite 8.2, shadcn/ui (to be installed), React Compiler

**Storage**: N/A (UI layer; data fetched from backend APIs)

**Testing**: Vitest (to be configured; currently no test dependencies present)

**Target Platform**: Web browsers (modern; Chrome, Firefox, Safari, Edge latest versions)

**Project Type**: Web application (React SPA frontend with TypeScript)

**Performance Goals**: 60 FPS carousel animations, < 3s page load on 4G, < 1.5s above-the-fold content visibility

**Constraints**: Mobile-first responsive design (< 375px, 768px, > 1024px breakpoints), 44x44px minimum touch targets, Lighthouse accessibility score ≥ 90, < 500ms backend API responses

**Scale/Scope**: Single homepage with 5 major sections (hero, promotions, slots, nav, footer); 3-5 new shadcn components; refactor existing components to use shadcn primitives

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I: Customer Privacy & Data Minimization** ✅ PASS
- No new PII collection; homepage displays public data (promotions, availability)
- No telemetry; design is UI-only

**Principle II: Reliability & Observability** ✅ PASS
- Frontend components do not process sensitive bookings; backend APIs are instrumented
- Skeleton loaders and error states for network failures documented in requirements

**Principle III: Test-First Development** ⚠️ NEEDS ATTENTION
- Tests will be required in Phase 2 (tasks.md) per specification requirement
- Must include unit tests for components and integration tests for carousel/slot rendering
- Action: Add test fixtures and E2E validation scenarios in tasks.md

**Principle IV: Simplicity & Minimal Scope** ✅ PASS
- Feature scope is narrow: UI enhancement only, reuses existing backend APIs
- No new dependencies beyond shadcn/ui (already compatible with Tailwind)
- Refactoring existing components rather than adding layers

**Principle V: Security & Compliance** ✅ PASS
- Authentication remains in Sign In/Sign Up modals (Dialog component)
- No new authorization logic required; homepage is public
- Booking operations remain protected at API layer

**GATE RESULT**: ✅ PASSED - Feature aligns with all constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── header.component.tsx          # Enhanced with shadcn Navigation/responsive
│   │   ├── footer.component.tsx          # Enhanced with shadcn Link components
│   │   ├── promo-carousel.component.tsx  # Refactored to use shadcn Carousel
│   │   ├── list.component.tsx            # Enhanced with shadcn Card/Badge
│   │   └── ui/                           # (NEW) shadcn component library
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── carousel.tsx
│   │       ├── dialog.tsx
│   │       ├── skeleton.tsx
│   │       ├── alert.tsx
│   │       └── sheet.tsx
│   ├── pages/
│   │   └── home.page.tsx                 # Refactored to use shadcn components
│   ├── models/
│   └── services/
└── tests/
    ├── unit/
    │   ├── components.test.tsx           # Component rendering tests
    │   └── hooks.test.ts
    └── integration/
        └── homepage.integration.test.tsx # End-to-end slot/promo rendering
```

**Structure Decision**: Web application (Option 2) - existing frontend + backend structure maintained. New `src/components/ui/` directory added for shadcn component library following shadcn/ui CLI conventions. Existing components refactored in-place to use shadcn primitives.

