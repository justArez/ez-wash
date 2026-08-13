# Booking API Contract

## Existing dashboard response extension

`GET /api/loyalty/dashboard?phone={phone}`

The existing response remains the authenticated customer's dashboard. For the booking page, it must include:

```json
{
  "bookingHistory": [
    {
      "id": "booking-id",
      "vehiclePlate": "ABC123",
      "vehicleModel": "Toyota Camry",
      "service": "Platinum Wash",
      "date": "2026-08-14",
      "time": "14:00",
      "status": "confirmed",
      "points": 3,
      "appliedPerks": [],
      "note": null
    }
  ],
  "lateCancellationWarningCount": 0,
  "priorityStatus": "normal"
}
```

Legacy records may omit optional display fields. The frontend must render stable fallbacks and must not reject the complete dashboard response.

## Cancel booking

`POST /api/bookings/{bookingId}/cancel`

Request:

```json
{
  "phone": "customer phone"
}
```

Success response for an on-time cancellation:

```json
{
  "success": true,
  "booking": {
    "id": "booking-id",
    "status": "cancelled",
    "isLateCancellation": false,
    "cancelledAt": "2026-08-13T10:00:00.000Z"
  },
  "warningCount": 0,
  "priorityStatus": "normal"
}
```

Success response for a late cancellation uses the same shape with `isLateCancellation: true`, an incremented `warningCount`, and `priorityStatus: "LOW_PRIORITIED"` when the count reaches three.

Error behavior:

- `400` for missing phone, invalid booking state, or a booking that does not belong to the customer.
- `404` when the booking cannot be found for the supplied customer.
- Duplicate cancellation is idempotent from the user's perspective: it returns the current cancelled state without incrementing the warning count again.

## UI contract

The page must expose:

- A section named `My Active Bookings` with labelled booking cards and `Cancel Booking` actions.
- A confirmation dialog with explicit confirm and dismiss actions.
- A prominent late-cancellation warning with status text available to assistive technology.
- A `See All` control that reveals `Historical Bookings Table`.
- Table headers `ID`, `Date`, `Time`, `Services`, `Status`, and `Points`.
- Page-size selector, `Previous`, `Next`, and current-page status with disabled boundary controls.