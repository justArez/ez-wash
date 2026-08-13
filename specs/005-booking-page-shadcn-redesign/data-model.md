# Data Model: Booking Page UI Replacement

## Booking

Represents a customer appointment and its lifecycle.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Unique booking identifier. |
| `customerId` | string | yes | Owner of the booking. |
| `vehiclePlate` | string | yes | Normalized vehicle identifier. |
| `vehicleModel` | string | no | Display detail; derive from linked vehicle when absent. |
| `service` | string | no | Service/package label; display `Car Wash` when absent. |
| `date` | string | yes | Existing stored date or ISO scheduled timestamp. |
| `time` | string | no | Scheduled time label for the history/card view; display `N/A` when absent. |
| `createdAt` | string | yes | Creation timestamp. |
| `appliedPerks` | string[] | yes | Existing loyalty perks. |
| `points` | number | no | Points earned or affected; display `--` when absent. |
| `status` | `confirmed \| blocked \| cancelled \| completed` | yes | Lifecycle state. |
| `cancelledAt` | string | no | Set once when cancellation succeeds. |
| `isLateCancellation` | boolean | no | Set true only for a cancellation at or within four hours. |
| `note` | string | no | Existing or policy-related detail. |

### Booking state transitions

- `confirmed -> cancelled`: allowed through the authenticated cancel operation; late timing sets the warning flag.
- `confirmed -> completed`: existing or future service completion flow.
- `confirmed -> confirmed`: duplicate cancellation attempts do not mutate the record.
- `blocked` is not cancellable as an upcoming service.
- `cancelled` and `completed` are history states, not active-card states.

## LoyaltyCustomer

Add the persistent policy state needed by the booking page.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `lateCancellationWarningCount` | number | yes for new records, default `0` for legacy records | Increment once per successful late cancellation. |
| `priorityStatus` | `normal \| LOW_PRIORITIED` | yes for new records, derive for legacy records | Set to `LOW_PRIORITIED` when warning count is at least 3. |

The existing `bookingHistory` and `pointHistory` remain owned by the customer. Legacy records are read with defaults rather than rewritten solely for display.

## DashboardResponse

The dashboard response continues to include customer identity, vehicles, tier, rewards, and histories. Its booking history entries expose the enriched booking fields plus a resolved vehicle model when available, and include `lateCancellationWarningCount` and `priorityStatus` for the booking-page banner/status treatment.

## Booking History View State

Frontend-only state:

- `showAll: boolean`, default `false`.
- `currentPage: number`, default `1`.
- `itemsPerPage: number`, default `10`.
- `cancellationBookingId: string | null`, used by the confirmation dialog.
- `cancellationStatus: idle | submitting | success | error` plus message.

Validation rules:

- Active bookings are confirmed bookings whose scheduled time is in the future; no more than five are shown.
- History includes all booking records and is sorted newest first for display.
- Page size changes reset `currentPage` to `1`.
- A successful cancellation updates the local booking state or refreshes the dashboard; a failed cancellation leaves visible data unchanged.
- Warning count cannot be incremented by duplicate requests for the same already-cancelled booking.