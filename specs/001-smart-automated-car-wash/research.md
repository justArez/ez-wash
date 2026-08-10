# Research: Smart Automated Car Wash

## Decision
Use the existing repository stack for the loyalty and booking feature: React + TypeScript + Vite on the frontend, and Bun + Elysia on the backend. Implement the loyalty engine and personalization logic with lightweight backend persistence and rule-based CRM-style signals, avoiding any heavy external AI/CRM dependency in this MVP.

## Rationale
- The repo already contains a TypeScript frontend and a Bun/Elysia backend, so keeping the feature in that stack is the lowest-risk path.
- The project constitution emphasizes simplicity and minimal scope, so the feature should avoid adding large new infrastructure or dependencies.
- AI/CRM personalization can be achieved initially with customer profile rules, loyalty tier signals, and vehicle model attributes rather than a separate external service.

## Alternatives Considered
- External CRM / AI service integration for reward personalization.
  - Rejected for MVP because the repository does not currently include an external integration, and adding one would violate the minimal-scope constraint.
- Adding a full relational database (PostgreSQL/MySQL).
  - Rejected because the existing backend has no database dependency and the feature can use a lightweight persisted store or file-backed data model for initial implementation.
- Implementing the loyalty feature entirely in the frontend.
  - Rejected because loyalty calculations, booking rules, and tier enforcement must be enforced on the backend.

## Resolved Clarifications
- Storage: Implement with lightweight backend persistence aligned with existing Bun/Elysia services, using a file-backed or simple JSON-backed store for MVP and preserving data across restarts.
- Personalization: Use CRM-style customer profile signals and tier/model attributes for personalized reward offers; external AI/CRM integration is a future enhancement.
- Checkout perks: Apply eligible tier perks automatically in backend booking checkout flows using tier rules and customer eligibility.
- Interface: Expose backend endpoints for the frontend loyalty dashboard, booking flow, reward suggestions, and admin tier management.
