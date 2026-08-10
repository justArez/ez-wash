# API Contracts: Smart Automated Car Wash

## Loyalty Endpoints

### POST /api/loyalty/link
Request:
- `phone`: string
- `plate`: string
- `model`: string
- `type`: `car` | `motorcycle`

Response:
- `customerId`: string
- `phone`: string
- `tier`: LoyaltyTier
- `pointsBalance`: number
- `vehicles`: Vehicle[]

### GET /api/loyalty/dashboard
Query:
- `phone`: string

Response:
- `customerId`: string
- `phone`: string
- `tier`: LoyaltyTier
- `pointsBalance`: number
- `vehicles`: Vehicle[]
- `nextEligibleBookingDate`: string
- `appliedPerks`: string[]
- `rewardSuggestions`: RewardOffer[]
- `bookingHistory`: Booking[]
- `pointHistory`: PointTransaction[]

## Booking Endpoints

### POST /api/bookings
Request:
- `phone`: string
- `vehiclePlate`: string
- `requestedDate`: string

Response:
- `success`: boolean
- `booking?`: Booking
- `reason?`: string
- `nextEligibleBookingDate?`: string

## Rewards Endpoints

### GET /api/rewards/suggestions
Query:
- `phone`: string

Response:
- `RewardOffer[]`

## Admin Endpoints

### GET /api/admin/tiers
Response:
- `tiers`: LoyaltyTier[]

### POST /api/admin/tiers
Request:
- `name`: string
- `bookingWindowDays`: number
- `pointRate`: number
- `perks`: string[]
- `description`: string
- `isActive`: boolean

Response:
- `tier`: LoyaltyTier

### PUT /api/admin/tiers/:tierId
Request:
- `name`: string
- `bookingWindowDays`: number
- `pointRate`: number
- `perks`: string[]
- `description`: string
- `isActive`: boolean

Response:
- `tier`: LoyaltyTier

### DELETE /api/admin/tiers/:tierId
Response:
- `deleted`: boolean

## Contract Notes
- Reward suggestions and checkout perks are computed using the customer tier, vehicle model, and profile signals.
- Booking creation validates the tier-specific window and returns `nextEligibleBookingDate` when blocked.
- Admin tier updates are persisted and used for future evaluations rather than retroactively changing active bookings or redemptions.
