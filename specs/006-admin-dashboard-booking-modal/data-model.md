# Data Model: Admin Dashboard + Booking Modal

## AdminUser

- `id`: string
- `email`: string
- `fullname`: string
- `role`: string (`admin`)
- `status`: string (`active` / `inactive`)
- `lastLoginAt`: string (ISO timestamp)

## CustomerProfile

- `id`: string
- `fullname`: string
- `email`: string
- `phone`: string
- `vehicles`: Vehicle[]
- `loyaltyPoints`: number
- `priorityStatus`: string (`normal` / `low_prioritized`)
- `mostActiveVehicle`: string

## Vehicle

- `id`: string
- `model`: string
- `type`: string (`car` / `motorbike`)
- `licensePlate`: string

## Booking

- `id`: string
- `customerId`: string
- `status`: string (`pending` / `confirmed` / `completed` / `cancelled`)
- `tier`: string
- `isLowPrioritized`: boolean
- `timeslot`: string (`2026-08-16T14:00:00.000Z`)
- `services`: BookingService[]
- `durationSlots`: number
- `createdAt`: string
- `updatedAt`: string
- `completedAt`: string | null
- `cancelledAt`: string | null

## BookingService

- `serviceId`: string
- `name`: string
- `price`: number
- `durationSlots`: number
- `vehicleType`: string
- `allowedTimeslots`: string[]

## Service

- `id`: string
- `name`: string
- `description`: string
- `price`: number
- `status`: string (`active` / `inactive`)
- `applicableVehicleType`: string (`car` / `motorbike` / `all`)
- `durationSlots`: number
- `allowedTimeslots`: string[]

## Promo

- `id`: string
- `name`: string
- `description`: string
- `tierId`: string
- `pointsCost`: number
- `status`: string (`active` / `inactive`)

## TierSet

- `id`: string
- `name`: string
- `tiers`: Tier[]
- `isActive`: boolean

## Tier

- `id`: string
- `name`: string
- `thresholdPoints`: number

## BookingModalSelection

- `customerContact`: {
  - `phone`: string
  - `email`: string
  - `licensePlate`: string
}
- `vehicle`: {
  - `model`: string
  - `type`: string
}
- `selectedServices`: string[]
- `totalCost`: number
- `errors`: string[]
- `warnings`: string[]

## State Transitions

- `pending` -> `confirmed` when admin confirms arrival.
- `confirmed` -> `completed` only after the booked timeslot has passed by at least 10 minutes.
- `pending` or `confirmed` -> `cancelled` when admin rejects/cancels or customer cancels through the booking modal.
- `cancelled` and `completed` are terminal states.
