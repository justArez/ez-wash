# Data Model: Customer & Admin Loyalty Flow

## Entities

### Customer
- `id`: string
- `phone`: string
- `licensePlates`: string[]
- `tierId`: string
- `pointsBalance`: number
- `vehicles`: Vehicle[]
- `pointHistory`: PointTransaction[]
- `bookingHistory`: Booking[]
- `fullName?`: string
- `username?`: string
- `email?`: string
- `createdAt`: string
- `updatedAt`: string

### Vehicle
- `plate`: string
- `model`: string
- `type`: "car" | "motorcycle"
- `lastWashDate?`: string

### LoyaltyTier
- `id`: string
- `name`: string
- `bookingWindowDays`: number
- `pointRate`: number
- `perks`: string[]
- `description`: string
- `isActive`: boolean
- `createdAt`: string
- `updatedAt`: string

### Promotion
- `id`: string
- `name`: string
- `description`: string
- `applicableTiers`: string[]
- `applicableVehicleModels`: string[]
- `startDate`: string
- `endDate`: string
- `isActive`: boolean

### RewardOffer
- `id`: string
- `title`: string
- `description`: string
- `pointsRequired`: number
- `eligibleTiers`: string[]
- `vehicleTypes?`: ("car" | "motorcycle")[]

### Booking
- `id`: string
- `customerId`: string
- `vehiclePlate`: string
- `date`: string
- `createdAt`: string
- `appliedPerks`: string[]
- `status`: "confirmed" | "blocked"
- `note?`: string

### PointTransaction
- `id`: string
- `type`: "earn" | "spend" | "expire"
- `amount`: number
- `date`: string
- `description`: string

### AuditLog
- `id`: string
- `actor`: string
- `actionType`: string
- `entityType`: string
- `entityId`: string
- `timestamp`: string
- `details`: string

## Relationships

- A `Customer` has one loyalty `Tier` via `tierId`.
- A `Customer` has many `Booking` records in `bookingHistory`.
- A `Customer` has many `PointTransaction` records in `pointHistory`.
- `Promotion` and `RewardOffer` reference eligible tiers through string arrays.
- `AuditLog` entries record admin actions against tiers, promotions, and customer point adjustments.

## Validation and Constraints

- `pointsBalance` is non-negative.
- `Booking.status` is limited to `confirmed` or `blocked`.
- `Promotion.startDate` and `Promotion.endDate` must be valid ISO date strings and `startDate` should be on or before `endDate`.
- `RewardOffer.pointsRequired` must be a positive number.
- `Customer.vehicles` should include at least one vehicle plate for linked accounts.
- `User deletion` is implemented as a soft state change rather than physical removal.
