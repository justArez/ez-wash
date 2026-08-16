# API Contracts: Admin Dashboard + Booking Modal

## Admin Authentication

### POST /api/admin/login

Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Success Response:

```json
{
  "success": true,
  "adminId": "admin-123",
  "token": "jwt-token",
  "redirect": "/admin/dashboard"
}
```

Error Responses:

- `401` when credentials are invalid.
- `403` when the account is not authorized for admin access.

## Admin Dashboard

### GET /api/admin/dashboard

Response:

```json
{
  "summary": {
    "totalBookings": 42,
    "pending": 8,
    "confirmed": 25,
    "completed": 7,
    "cancellations": 2
  },
  "capacity": {
    "availableSlots": 14,
    "activeServices": 7
  },
  "tierUsage": [
    { "tier": "Silver", "count": 12 },
    { "tier": "Gold", "count": 9 }
  ]
}
```

## Booking Management

### GET /api/admin/bookings

Response:

```json
[
  {
    "id": "booking-123",
    "customerName": "Jane Doe",
    "tier": "Gold",
    "status": "pending",
    "timeslot": "2026-08-16T14:00:00.000Z",
    "services": ["Standard Wash", "Wax"],
    "isLowPrioritized": false
  }
]
```

### POST /api/admin/bookings/{bookingId}/confirm

Request:

```json
{
  "adminId": "admin-123"
}
```

Success:

```json
{
  "success": true,
  "bookingId": "booking-123",
  "status": "confirmed"
}
```

### POST /api/admin/bookings/{bookingId}/complete

Request:

```json
{
  "adminId": "admin-123"
}
```

Success:

```json
{
  "success": true,
  "bookingId": "booking-123",
  "status": "completed"
}
```

Failure:

- `400` when called before the booked timeslot has passed by at least 10 minutes.

### POST /api/admin/bookings/{bookingId}/cancel

Request:

```json
{
  "adminId": "admin-123",
  "reason": "Customer no-show"
}
```

Success:

```json
{
  "success": true,
  "bookingId": "booking-123",
  "status": "cancelled"
}
```

## Service Management

### GET /api/admin/services

Response:

```json
[
  {
    "id": "service-1",
    "name": "Standard Wash",
    "description": "Exterior wash and dry",
    "price": 100,
    "status": "active",
    "applicableVehicleType": "all",
    "durationSlots": 1,
    "allowedTimeslots": ["08:00-14:00"]
  }
]
```

### POST /api/admin/services

Request:

```json
{
  "name": "Engine Bay Wash",
  "description": "Engine area cleaning",
  "price": 140,
  "status": "active",
  "applicableVehicleType": "car",
  "durationSlots": 2,
  "allowedTimeslots": ["08:00-14:00"]
}
```

## Promo Management

### GET /api/admin/promos

Response:

```json
[
  {
    "id": "promo-1",
    "name": "Gold Member Bonus",
    "tierId": "gold",
    "pointsCost": 50,
    "status": "active"
  }
]
```

### POST /api/admin/promos

Request:

```json
{
  "name": "Summer Wash",
  "tierId": "silver",
  "pointsCost": 20,
  "status": "active"
}
```

## Tier Management

### GET /api/admin/tiers

Response:

```json
[
  {
    "id": "tierset-1",
    "name": "Default Loyalty Set",
    "tiers": [
      { "id": "silver", "name": "Silver", "thresholdPoints": 100 },
      { "id": "gold", "name": "Gold", "thresholdPoints": 250 }
    ],
    "isActive": true
  }
]
```

### POST /api/admin/tiers

Request:

```json
{
  "name": "Winter Set",
  "tiers": [
    { "name": "Silver", "thresholdPoints": 100 },
    { "name": "Gold", "thresholdPoints": 250 }
  ]
}
```

## User Management

### GET /api/admin/users

Response:

```json
[
  {
    "id": "user-123",
    "fullname": "Jane Doe",
    "email": "jane@example.com",
    "phone": "0123456789",
    "mostActiveVehicle": "Toyota Camry",
    "loyaltyPoints": 180
  }
]
```

### POST /api/admin/users/{userId}/adjust-points

Request:

```json
{
  "adminId": "admin-123",
  "pointsDelta": 20,
  "reason": "Compensation for late service"
}
```

Success:

```json
{
  "success": true,
  "userId": "user-123",
  "newPointsTotal": 200
}
```

## Booking Modal UI Contract

- The Booking Modal must display required customer fields: phone, email, license plate, vehicle model, and vehicle type.
- Service options must be filtered by selected vehicle type.
- Services outside allowed timeslots or exceeding capacity must be disabled and show a warning.
- The Confirm Booking action must remain disabled until required fields are completed and at least one valid service is selected.
- Guests who attempt to book a slot must be routed to the Sign In / Sign Up modal instead.
