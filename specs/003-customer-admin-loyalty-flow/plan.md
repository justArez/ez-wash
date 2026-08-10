# Implementation Plan: Customer & Admin Loyalty Flow

**Branch**: `003-customer-admin-loyalty-flow` | **Date**: 2026-08-11 | **Spec**: spec.md

**Input**: Feature specification from `/specs/003-customer-admin-loyalty-flow/spec.md`

**Note**: This file captures the design and implementation intent for the customer loyalty and admin management flows.

## Summary

This feature adds a customer loyalty experience and an admin management dashboard to the existing Ez Wash web application. Customers gain a guest-to-authenticated homepage, active bookings modal, full bookings page with booking and point history, and a tier-aware promo page. Admins gain a secure management interface for tiers, promotions, bookings, and users, including audit-backed point adjustments and soft user deactivation.

## Technical Context

**Language/Version**: TypeScript; backend runtime uses Bun with Elysia-style routes; frontend uses React on Vite.

**Primary Dependencies**: React 19, Vite 8, Bun, Elysia-compatible backend routing, TypeScript 6.

**Storage**: Backend persists a local loyalty store via `backend/src/storage.ts` and in-memory objects; no separate database is added for this feature.

**Testing**: Existing repo scripts support `npm test` across workspaces; backend unit/integration tests should be added under `backend/tests` and frontend UI tests under `frontend/tests` as needed.

**Target Platform**: Web browser frontend with a server-side Bun backend.

**Project Type**: Web application with separate frontend and backend packages.

**Performance Goals**: UI actions should complete within 2 seconds for customer navigation and admin operations at low expected load; admin list and detail views should be responsive with small data volumes.

**Constraints**: Avoid adding heavy dependencies or new runtime platforms; preserve the existing Bun/Elysia and React/Vite architecture; implement within the current workspace structure.

**Scale/Scope**: Small loyalty feature intended for the existing Ez Wash app, supporting the current customer base and admin operations without large-scale multi-tenant or payment subsystem expansion.

## Constitution Check

- **Customer Privacy & Data Minimization**: This plan uses only customer fields required for loyalty and booking tasks, and does not introduce broad PII collection beyond phone, license plates, and user profile data already present in the loyalty domain.
- **Reliability & Observability**: Admin operations and booking flows will be designed for retry-friendly behavior, audit logging, and structured metrics instrumentation in backend routes and services.
- **Test-First Development**: The plan includes adding tests for customer flows, promo eligibility, admin CRUD operations, audit logs, and soft deletion behavior.
- **Simplicity & Minimal Scope**: The design reuses existing frontend/backend structure and avoids premature extensibility by focusing on the specified customer and admin screens.
- **Security & Compliance**: Admin endpoints require explicit admin authorization headers; audit logs capture loyalty point adjustments and tier/promotions changes.

This plan does not introduce any constitution violations and is safe to proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/003-customer-admin-loyalty-flow/
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
│   ├── storage.ts
│   ├── models/
│   ├── routes/
│   └── services/

frontend/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
```

**Structure Decision**: Use the existing web application structure with `frontend/` for customer and admin UI and `backend/` for the API/service layer.

## Complexity Tracking

No constitution violations were identified that require additional complexity justification.
