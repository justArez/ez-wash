# Implementation Plan: Smart Automated Car Wash

**Branch**: `001-smart-automated-car-wash` | **Date**: 2026-08-10 | **Spec**: `/specs/001-smart-automated-car-wash/spec.md`

**Input**: Feature specification from `/specs/001-smart-automated-car-wash/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a loyalty-driven advance booking feature for EzWash that supports shared customer accounts across linked vehicles, tier-based booking windows, personalized reward suggestions, and automatic checkout tier perks. The implementation stays within the existing repo stack: React + TypeScript + Vite frontend, and Bun + Elysia backend, using lightweight backend persistence and rule-based personalization instead of heavy external AI/CRM services.

## Technical Context

**Language/Version**: TypeScript (frontend and backend), Bun runtime for backend.

**Primary Dependencies**: React, Vite, Elysia, Bun.

**Storage**: Lightweight backend persistence suitable for Bun/Elysia; file-backed JSON or in-memory store with persistence support for MVP.

**Testing**: Frontend tests via existing Vite/TypeScript test tools if present; backend tests via Bun-compatible test harness or script. The repository constitution requires automated unit/integration/contract tests for business flows, and test artifacts are a gating deliverable for implementation completion.

**Target Platform**: Web application with backend service; frontend served by Vite and API served by Bun/Elysia.

**Project Type**: Web application (frontend + backend).

**Performance Goals**: Enforce booking window checks and tier calculations with low latency; support typical small-to-medium user load for a loyalty booking service.

**Constraints**: Avoid heavy dependencies or new infrastructure. No payment subsystem; no external AI/CRM dependency for MVP. Keep logic simple and reviewable.
- The monthly tier evaluation must be realizable via a lightweight scheduler or cron-like process running in the existing Bun backend.

**Scale/Scope**: Single-feature loyalty booking system within an existing EzWash web app.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I (Privacy): The feature collects only minimal PII (license plate, phone) and uses customer profile signals for personalization without new broad data capture.
- Principle II (Reliability): Booking, points redemption, and tier evaluation are designed as backend-enforced flows.
- Principle III (Test-First): The plan includes contract and validation artifacts to support later tests.
- Principle IV (Simplicity): The plan chooses existing stack and lightweight persistence to avoid premature platform expansion.
- Principle V (Security): The plan keeps authentication and admin access boundaries explicit in API contract definitions.

**Gates**: No constitution violations identified at this plan stage.

## Project Structure

### Documentation (this feature)

```text
specs/001-smart-automated-car-wash/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-endpoints.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── package.json
├── bun.lock
└── src/
frontend/
├── package.json
├── tsconfig.json
└── src/
```

**Structure Decision**: Use the existing `backend/` and `frontend/` projects. Backend code and API services will live in `backend/src/`; frontend loyalty UI components and services will be added in `frontend/src/`.

## Complexity Tracking

No constitution-level complexity violations require justification for this phase.
