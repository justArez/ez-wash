# API Endpoints: Customer & Admin Loyalty Flow

## Customer-Facing Endpoints

### POST /api/loyalty/link
Link a customer account with phone and vehicle details.

Request body:
- `phone`: string
- `plate`: string
- `model`: string
- `type`: "car" | "motorcycle"

Response:
- `customerId`: string
- `phone`: string
- `tier`: LoyaltyTier
- `pointsBalance`: number
- `vehicles`: Vehicle[]

### GET /api/loyalty/dashboard
Retrieve a loyalty dashboard for a customer within the app.

Query parameters:
- `phone`: string (required)

Response:
- Customer loyalty dashboard object (tier, points, active bookings, rewards, promo visibility)

### POST /api/bookings
Create a booking request for a logged-in customer.

Request body:
- `phone`: string
- `vehiclePlate`: string
- `requestedDate`: string

Response:
- Booking creation result or error details

### GET /api/rewards/suggestions
Retrieve loyalty reward suggestions for a customer based on current tier, points, and vehicle profile.

Query parameters:
- `phone`: string (required)

Response:
- Array of `RewardOffer` objects matching the customer's tier and eligibility

## Admin Endpoints

### GET /api/admin/tiers
List loyalty tiers.

Response:
- `tiers`: LoyaltyTier[]

### POST /api/admin/tiers
Create a loyalty tier.

Request body:
- `name`: string
- `bookingWindowDays`: number
- `pointRate`: number
- `perks`: string[]
- `description`: string
- `isActive`: boolean

Response:
- `tier`: LoyaltyTier

### PUT /api/admin/tiers/:tierId
Update a loyalty tier.

Response:
- `tier`: LoyaltyTier

### DELETE /api/admin/tiers/:tierId
Delete a loyalty tier.

Response:
- `deleted`: boolean

### GET /api/admin/promotions
List admin promotions.

Response:
- `promotions`: Promotion[]

### POST /api/admin/promotions
Create a promotion.

Request body:
- `name`: string
- `description`: string
- `applicableTiers`: string[]
- `startDate`: string
- `endDate`: string
- `isActive`: boolean

Response:
- `promotion`: Promotion

### PUT /api/admin/promotions/:promotionId
Update a promotion.

Response:
- `promotion`: Promotion

### DELETE /api/admin/promotions/:promotionId
Delete a promotion.

Response:
- `deleted`: boolean

### GET /api/admin/audit-logs
List admin audit log entries.

Response:
- `auditLogs`: AuditLog[]

## Notes

- Admin endpoints require an authorization header containing the admin token or `x-admin-token` header.
- Customer dashboard and booking endpoints require valid customer phone and vehicle details.
- Promotion and tier management is primarily admin-facing; the customer-facing app consumes tier eligibility from these records.
