# Research: Customer & Admin Loyalty Flow

## Decision: Use existing web stack for implementation

**Rationale**: The repository already contains a TypeScript React frontend and a Bun-based backend with Elysia-style routing. Extending these existing packages avoids adding new frameworks and keeps the feature aligned with the project constitution.

**Alternatives considered**:
- Adding a separate service or heavy backend framework: rejected because it would violate the minimal-scope principle.
- Implementing admin UI in a separate app: rejected because the current repository already supports both frontend and backend within a single workspace.

## Decision: Maintain audit records for admin loyalty point changes

**Rationale**: Admin point adjustment is a sensitive operation under the security and compliance principle. Recording audit entries provides explicit accountability for user point changes.

**Alternatives considered**:
- Only log high-risk adjustments: rejected because the constitution mandates explicit auditability for sensitive operations.
- No audit tracking: rejected because it would conflict with security and compliance expectations.

## Decision: Promo eligibility is tier-aware but visible beyond current tier

**Rationale**: Customers can view higher-tier offers to understand loyalty progression while redemption remains limited to current-tier promotions. This keeps the UX informative without broadening eligibility rules.

**Alternatives considered**:
- Restricting visibility to current tier only: rejected because it would reduce transparency.
- Allowing redemption across all tiers: rejected because it would complicate eligibility logic and customer expectations.

## Decision: Most active vehicle is defined by booking count

**Rationale**: Booking count is a stable and simple metric that can be computed from existing booking history data without introducing additional weighting or spend-based evaluation.

**Alternatives considered**:
- Last used vehicle: too volatile for a meaningful activity indicator.
- Total usage value: rejected due to lack of spend tracking requirements in the current scope.

## Decision: Admin user deletion is soft-deactivation

**Rationale**: Preserving historical profile data supports auditability, prevents accidental loss, and aligns with the existing loyalty history model.

**Alternatives considered**:
- Hard delete: rejected because it would remove historical records and violate the audit-preservation approach.
- No delete support: rejected because the feature requirement explicitly mentions user CRUD.
