# Quickstart: Booking Page UI Replacement

## Prerequisites

- Node.js/npm for the frontend package.
- Bun for the backend package and tests.
- The repository's local backend available at `http://localhost:3000` and frontend at the Vite URL.

## Install and run

From the repository root:

```powershell
cd backend
bun install
bun run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Automated validation

Backend tests:

```powershell
cd backend
npm test
```

Frontend build and lint:

```powershell
cd frontend
npm run build
npm run lint
```

The implementation must also add focused backend tests for the service and cancel route. The required cases are described in [booking-api.md](contracts/booking-api.md) and [data-model.md](data-model.md).

## Manual browser scenarios

1. Link or sign in to a customer with at least one future booking and open Bookings from the global header.
2. Confirm that `My Active Bookings` appears before history and that the nearest bookings show service, date, time, vehicle model, and plate.
3. Open cancellation confirmation for a booking more than four hours away. Confirm it and verify cancelled status without a late warning.
4. Repeat with a booking exactly four hours away or less. Confirm it and verify the prominent warning and incremented warning count.
5. Repeat late cancellation until the third warning and verify `LOW PRIORITIED` appears.
6. Select `See All`, verify all six history columns, choose a different page size, and use Previous/Next at a dataset larger than one page.
7. Repeat the review at 320px, 768px, and desktop width. Verify no horizontal scroll, clipped text, or inaccessible controls.

## Expected outcome

The page remains within the authenticated application shell, cancellation failures preserve the visible dashboard state, legacy records render with fallbacks, and all interactive controls are keyboard reachable.