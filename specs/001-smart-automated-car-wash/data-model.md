# Data Model: Smart Automated Car Wash

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
- `createdAt`: string
- `updatedAt`: string

### Vehicle
- `plate`: string
- `model`: string
- `type`: `car` | `motorcycle`
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

### Booking
- `id`: string
- `customerId`: string
- `vehiclePlate`: string
- `date`: string
- `createdAt`: string
- `appliedPerks`: string[]
- `status`: `confirmed` | `blocked`
- `note?`: string

### RewardOffer
- `id`: string
- `title`: string
- `description`: string
- `pointsRequired`: number
- `eligibleTiers`: LoyaltyTierId[]
- `vehicleTypes?`: VehicleType[]

### PointTransaction
- `id`: string
- `type`: `earn` | `spend` | `expire`
- `amount`: number
- `date`: string
- `description`: string

### Promotion
- `id`: string
- `name`: string
- `description`: string
- `applicableTiers`: string[]
- `applicableVehicleModels`: string[]
- `startDate`: string
- `endDate`: string

## Relationships
- One `Customer` can have many `Vehicle` records and many `Booking` records.
- One `Customer` owns a shared loyalty account across all linked license plates.
- `Booking` references the `Customer` and the relevant `Vehicle` by plate.
- `Customer.tierId` references a `LoyaltyTier` record that can be created, updated, or deleted by admins.
- `RewardOffer` and `Promotion` are matched against `Customer.tierId`, `Vehicle.type`, and `Vehicle.model`.

## Validation Rules
- `Customer.phone` must be present and trimmed before use.
- `Vehicle.plate` must be non-empty and normalized to uppercase.
- `Booking.date` must fall inside the tier-defined booking window or be recorded as blocked with a next-eligible date.
- `RewardOffer.pointsRequired` must be affordable for the customer balance when redeemed.
- Points older than 12 months are eligible for expiration processing.
- Promotion eligibility is limited to tier thresholds such as Silver+ for this feature.
- Tier definitions must be admin-manageable through create, read, update, and delete operations.

## State Transitions
- Booking: `confirmed` or `blocked` outcomes are recorded in `bookingHistory`.
- Tier evaluation: monthly review updates the customer tier based on points and visit-related rules.
- Point lifecycle: `earn` → `spend` or `expire`; expired points are removed from available balance and recorded in history.
