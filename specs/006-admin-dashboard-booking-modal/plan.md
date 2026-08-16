# Implementation Plan: Admin Dashboard + Booking Modal

**Branch**: `006-admin-dashboard-booking-modal` | **Date**: 2026-08-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-admin-dashboard-booking-modal/spec.md`

**Note**: This plan documents the Phase 0 and Phase 1 design work for the admin dashboard and booking modal feature.

## Summary

Add an admin management experience and a logged-in customer booking modal on top of the existing EzWash web application. The feature enables administrators to sign in, view a dashboard, manage bookings, services, promos, tiers, and users, while customers can select a timeslot, provide booking details, and confirm a service with real-time availability validation.

## Technical Context

**Language/Version**: TypeScript 6 for frontend and backend, Bun runtime for backend, React 19 for frontend.

**Primary Dependencies**: Vite, Tailwind CSS, React, Elysia backend framework, existing application services and models.

**Storage**: Existing file-backed loyalty store and in-repo data model. No new external storage system is introduced.

**Testing**: Bun test for backend, TypeScript build validation, existing frontend test setup if available. Focus on backend route/service tests and frontend behavior coverage without adding heavy new frameworks.

**Target Platform**: Modern desktop and mobile browsers for frontend; local Bun-hosted backend service for development.

**Project Type**: Full-stack web application with separate `frontend/` and `backend/` packages under a monorepo.

**Performance Goals**: Admin navigation remains responsive within the existing app load budget. Booking modal and service validation updates should be visible within 3 seconds under normal local conditions.

**Constraints**: No new heavyweight dependencies. Preserve existing auth flow and store compatibility. Avoid introducing offline mode or payments. UI and backend changes must align with the current app architecture.

**Scale/Scope**: One admin dashboard feature, one customer booking modal feature, backend route/service updates for booking and admin operations, and frontend page/modal state updates.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The design follows the EzWash constitution principles:

- **Customer Privacy & Data Minimization**: Only required booking fields are collected for the modal. Admin operations manage existing customer records without introducing new PII flows.
- **Reliability & Observability**: Booking and admin operations are designed to be auditable and testable through structured route/service logic.
- **Test-First Development**: Backend routes and core business flow behavior must be covered by tests before implementation; frontend booking and admin actions should have behavior validation.
- **Simplicity & Minimal Scope**: The plan extends existing packages only; it does not introduce new services or external auth providers.
- **Security & Compliance**: Admin authentication boundary is explicit and operations that adjust points or booking state are isolated to the admin workflow.

No gate violations are expected for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/006-admin-dashboard-booking-modal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-endpoints.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── index.ts
│   ├── models/
│   ├── routes/
│   └── services/
└── tests/

frontend/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── models/
│   ├── pages/
│   ├── services/
│   └── types/
```

**Structure Decision**: Use the existing monorepo web application structure. Backend route/service changes live in `backend/src`, including new admin and booking APIs. Frontend UI changes live in `frontend/src`, including admin dashboard pages, booking modal components, and service selection state.

## Complexity Tracking

No constitution violations or additional architectural complexity require justification at this stage.
