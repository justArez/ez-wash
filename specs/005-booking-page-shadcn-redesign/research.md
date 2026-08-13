# Research: Booking Page UI Replacement with shadcn

**Date**: 2026-08-13

## Decision 1: Extend the existing booking service and dashboard contract

**Decision**: Keep the file-backed `LoyaltyStore` and existing customer dashboard as the source of truth. Add cancellation and warning state to the booking/customer model, expose cancellation through the existing booking route family, and return the enriched booking history through the dashboard response.

**Rationale**: The current page already receives `DashboardResponse`; using that path avoids a second customer-data fetch and preserves the authenticated flow. The current `Booking` model only supports creation and cannot represent cancelled/completed status or warning state, so a small domain extension is required.

**Alternatives considered**:

- Add a booking-specific history endpoint: rejected for this scope because it duplicates dashboard ownership and introduces a second pagination contract.
- Keep all cancellation state in the browser: rejected because warnings and priority status must persist and be enforced across sessions.

## Decision 2: Evaluate the four-hour policy at cancellation confirmation

**Decision**: Compare the scheduled timestamp with the current time when the cancellation operation is performed. Treat exactly four hours remaining as late, matching the specification's boundary rule.

**Rationale**: Page-load time can become stale while a customer waits. A service-side calculation is authoritative and prevents client clock or stale-page behavior from bypassing the policy.

**Alternatives considered**:

- Evaluate only when the page loads: rejected because a customer could leave the page open and receive the wrong policy outcome.
- Block late cancellation: rejected because the product requirement permits cancellation and requires a warning instead.

## Decision 3: Preserve legacy records with explicit display fallbacks

**Decision**: Add optional service, time, and points fields to new booking records and map missing legacy values to stable display fallbacks such as `Car Wash`, `N/A`, and `--`.

**Rationale**: Existing stored data has only a combined date string and no points field. Making new fields optional avoids a destructive migration while ensuring every card and table row remains structurally complete.

**Alternatives considered**:

- Rewrite all existing store records: rejected because it risks data loss and is unnecessary for a visual replacement.
- Hide columns for legacy rows: rejected because changing table shape per row makes history harder to scan.

## Decision 4: Use accessible Radix/shadcn-style primitives within existing dependencies

**Decision**: Build the replacement with the repository's current Radix dialog/slot foundation and its established CSS variables and component conventions. Add only small local primitives when the existing dependency set does not provide a needed table, badge, alert, or select component.

**Rationale**: The repository has a partial shadcn-compatible setup but no generated `components/ui` directory. Reusing existing packages avoids a heavy dependency expansion and keeps the visual replacement consistent with the current app.

**Alternatives considered**:

- Install a full component suite: rejected because it adds dependency and configuration scope beyond the page replacement.
- Continue with generic buttons and list items: rejected because it would preserve the legacy page's weak hierarchy and inaccessible confirmation behavior.

## Decision 5: Keep history pagination client-side for the current scale

**Decision**: Fetch the existing customer's history in the dashboard response and paginate it in the page with a default of 10 items.

**Rationale**: The current product has a small file-backed store and already slices history locally. This satisfies the specified interaction without adding server pagination, query parameters, or a second endpoint.

**Alternatives considered**:

- Add server-side pagination now: defer until history volume requires it; it would widen the contract and test surface without current evidence.

## Integration Findings

- Current page: `frontend/src/pages/booking.page.tsx` filters and slices sparse records but has no cancellation action or page-size selector.
- Current model: `backend/src/models/loyalty.model.ts` permits only `confirmed` and `blocked` booking states.
- Current route: `backend/src/routes/booking.route.ts` supports only `POST /api/bookings`.
- Current tests: backend tests use Bun's `describe`/`it` style and direct service/store assertions; no frontend test runner is configured.
- Current global shell: `frontend/src/App.tsx` supplies the authenticated dashboard and global header/footer around the page flow.