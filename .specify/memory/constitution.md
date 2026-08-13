# EzWash Constitution
<!--
Sync Impact Report
- Version change: 1.0.1 -> 1.1.0
- Modified principles: III. Test-First Development (clarified test-generation scope)
- Added sections: AI-Assisted Test Generation Budget
- Removed sections: none
- Follow-up TODOs: none
-->

## Core Principles

### I. Customer Privacy & Data Minimization
All personally-identifying data MUST be collected only when strictly necessary for the feature. Store only the minimal fields required (e.g., license plate, phone) and purge or anonymize historical records according to retention rules. Any telemetry sent externally MUST be aggregated and stripped of PII.

### II. Reliability & Observability
Services that process bookings, loyalty points, and tier calculations MUST be instrumented with structured logs and meaningful metrics (success/failure counts, latency, queue lengths). Critical flows (booking, points redemption) MUST have retry strategies and alerting configured.

### III. Test-First Development (NON-NEGOTIABLE)
New features and bug fixes MUST include automated tests reproducing the desired behavior before implementation (unit and integration tests where appropriate). Critical business flows (booking, loyalty calculations, tiering) MUST have end-to-end contract tests. Playwright tests are governed separately by the AI-Assisted Test Generation Budget section.

### IV. Simplicity & Minimal Scope
Prefer minimal viable solutions. Design choices SHOULD favor clarity and maintainability over speculative extensibility. Avoid premature optimization; break complex features into incremental, reviewable increments.

### V. Security & Compliance
Authentication and authorization boundaries MUST be explicit. Sensitive operations (tier changes, points adjustments) MUST be auditable. Follow principle of least privilege for service accounts and third-party integrations.

## Technology & Constraints
Primary stack: TypeScript frontend (Vite/React) and a backend service (see repository structure). Avoid adding heavy dependencies without documented justification. Offline or payment subsystems are out-of-scope for this project unless explicitly approved.

## Development Workflow
- Code review required for all changes; PRs MUST include a description of user-visible behavior and tests.
- CI MUST run the test suite and basic linting; failing checks block merges.
- Use semantic versioning for releases; document breaking changes in changelogs.

## AI-Assisted Test Generation Budget
AI agents MUST NOT generate Playwright tests by default. Playwright tests MAY be added only when the user explicitly requests them or when the change is a documented high-risk end-to-end workflow that cannot be adequately verified with existing unit, integration, or manual browser checks. When Playwright generation is skipped, the agent MUST use the cheapest relevant available validation and MUST state that Playwright coverage was intentionally omitted. This rule controls AI-generated test scope and does not prohibit developers from writing or running Playwright tests independently.

## Governance
This constitution governs decision-making for project architecture, development practices, and release procedures. Amendments require a documented proposal and approval from the core maintainers. Emergency patches may be applied but must be followed by a retroactive proposal documenting the change and rationale.

**Version**: 1.1.0 | **Ratified**: 2026-08-10 | **Last Amended**: 2026-08-13

