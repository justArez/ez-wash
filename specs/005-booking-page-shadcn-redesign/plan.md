# Implementation Plan: Booking Page UI Replacement with shadcn

**Branch**: `005-booking-page-shadcn-redesign` | **Date**: 2026-08-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-booking-page-shadcn-redesign/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace the legacy authenticated booking page with a responsive, accessible booking workspace. The page will foreground up to five upcoming bookings as cards, support confirmed cancellation with the four-hour late-warning policy, and reveal a paginated history table with service, time, status, and points information. The existing dashboard remains the source of customer data; the backend booking service and route will be extended only where the current contract cannot represent cancellation and warning state.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 6, React 19, Bun runtime/test runner

**Primary Dependencies**: Vite, existing Radix UI packages, Tailwind CSS 4, existing Elysia backend

**Storage**: Existing file-backed `LoyaltyStore`; preserve compatibility with existing stored customers and bookings

**Testing**: Bun backend unit/route tests, TypeScript build, ESLint; focused frontend behavior tests only if the repository test setup supports them without introducing a disproportionate new framework

**Target Platform**: Modern desktop and mobile browsers; Bun-powered local backend

**Project Type**: Full-stack web application with React frontend and TypeScript HTTP backend

**Performance Goals**: Booking page becomes usable within the existing application load budget; valid cancellation feedback is visible within 3 seconds under normal local/API conditions; pagination and card interactions remain immediate for at least 100 history records

**Constraints**: Preserve existing auth/navigation flow and legacy stored data; no payments, rescheduling, refunds, admin workflow, or heavy dependency additions; no horizontal scrolling from 320px through 1440px

**Scale/Scope**: One authenticated customer page, one booking-service extension, one cancel route, dashboard contract updates, focused backend tests, and responsive UI styling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The design passes all constitution gates:

- **Privacy**: No new customer PII is collected; cancellation state is attached to existing customer records and exposed only through the authenticated dashboard.
- **Reliability/Observability**: Cancellation success/failure and late-warning state will be auditable through the existing audit-log model and route/service error responses.
- **Test-first**: Backend service and route tests will cover normal cancellation, exactly-four-hour/late cancellation, duplicate cancellation, and third-warning priority transition before implementation changes are considered complete.
- **Simplicity**: The implementation extends the current store and dashboard contract and keeps history pagination client-side at the current scale; no new persistence layer or UI framework is introduced.
- **Security**: The existing customer lookup boundary is retained; the cancel operation requires the customer's phone plus booking identity and verifies ownership before mutation.

No violations require justification.

## Project Structure

### Documentation (this feature)

```text
specs/005-booking-page-shadcn-redesign/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── models/loyalty.model.ts
│   ├── services/loyalty.service.ts
│   └── routes/booking.route.ts
└── tests/
  ├── booking.service.test.ts
  └── booking.route.test.ts

frontend/
├── src/
│   ├── pages/booking.page.tsx
│   ├── services/loyalty.service.ts
│   ├── models/loyalty.model.ts
│   └── App.css
└── package.json
```

**Structure Decision**: Use the existing two-project web application layout. Backend changes own booking state transitions and API contracts; frontend changes own the page composition, interaction state, responsive presentation, and API client calls. Shared type definitions are mirrored in the existing frontend and backend model files because the repository does not currently use a shared package.

## Complexity Tracking

No constitution violations or additional architectural complexity are introduced by this feature.
