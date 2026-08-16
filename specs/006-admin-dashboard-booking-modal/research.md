# Research: Admin Dashboard + Booking Modal

## Decision 1: Use existing frontend/backend architecture

Decision: Build the admin dashboard and booking modal within the current full-stack web application using the existing frontend `frontend/` and backend `backend/` packages.

Rationale: The repo already has a React/Vite frontend and Bun/Elysia backend, so adding the feature within the same structure avoids new dependency weight and preserves current architecture.

Alternatives considered:
- New standalone admin service: rejected because it would add unnecessary complexity.
- External authentication provider: rejected because current project scope and team-provided user flows assume local app auth.

## Decision 2: Admin authentication via app sign-in boundary

Decision: Reuse or extend the current app authentication boundary for admin sign-in rather than introducing separate SSO or external identity providers.

Rationale: The feature description indicates a simple Admin Login that redirects to a dashboard, and the repository uses a self-contained webapp stack. This keeps the admin path consistent with existing login flows and minimizes integration work.

Alternatives considered:
- Role-based SSO: more complex and out of scope for the current feature.
- Guest booking via token: unnecessary because admin users are distinct and require explicit authentication.

## Decision 3: Booking Modal enforces service availability in both UI and backend

Decision: Implement service availability checks in the modal UI and validate them server-side for allowed timeslots and duration capacity.

Rationale: The feature requirements explicitly call for warnings and disabled service options when timeslots are invalid or capacity is insufficient. A dual-layer approach ensures correct behavior even if a client-side state mismatch occurs.

Alternatives considered:
- Client-only checks: rejected due to risk of inconsistent service selection and business-rule bypass.
- Backend-only checks with generic errors: rejected because the user experience requires immediate, actionable warnings.
