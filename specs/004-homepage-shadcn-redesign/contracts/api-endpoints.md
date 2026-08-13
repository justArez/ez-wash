# API Contracts: Homepage UI Enhancement with shadcn

**Feature**: Homepage UI Enhancement with shadcn  
**Date**: 2026-08-13  
**Scope**: Define API request/response schemas for homepage data fetching

## Overview

The homepage fetches two primary data sources:
1. **Promotions** - Active promotional offers for the carousel
2. **Time Slots** - Available washing slots for the next 7 days

Both endpoints are guest-accessible (no authentication required for browsing).

---

## Endpoint 1: Get Promotions

### Request

```http
GET /api/promotions
```

**Query Parameters**: None (returns all active promotions)

**Headers**:
```
Content-Type: application/json
```

**Authentication**: Not required for guest users

### Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "promo-001",
      "name": "20% OFF GOLD",
      "description": "Get 20% off on Gold wash package",
      "discountPercentage": 20,
      "loyaltyPointsRequired": 500,
      "loyaltyPointsValue": 100,
      "expiryDate": "2026-12-31T23:59:59Z",
      "category": "discount",
      "terms": "Valid on selected wash packages. Cannot be combined with other offers.",
      "isActive": true,
      "createdAt": "2026-08-01T10:00:00Z",
      "updatedAt": "2026-08-13T15:30:00Z"
    },
    {
      "id": "promo-002",
      "name": "FREE TIRE SHINE",
      "description": "Complimentary tire shine with any wash",
      "discountPercentage": 0,
      "loyaltyPointsRequired": 0,
      "loyaltyPointsValue": 50,
      "expiryDate": "2026-10-31T23:59:59Z",
      "category": "points_bonus",
      "terms": "Included in all wash packages during promo period.",
      "isActive": true,
      "createdAt": "2026-08-05T10:00:00Z",
      "updatedAt": "2026-08-13T15:30:00Z"
    },
    {
      "id": "promo-003",
      "name": "NEW MEMBER WASH FOR 1K",
      "description": "First wash at 1000 loyalty points for new members",
      "discountPercentage": 0,
      "loyaltyPointsRequired": 1000,
      "loyaltyPointsValue": 0,
      "expiryDate": "2026-09-30T23:59:59Z",
      "category": "new_member",
      "terms": "Limited to new members only. Valid for first booking.",
      "isActive": true,
      "createdAt": "2026-07-15T10:00:00Z",
      "updatedAt": "2026-08-13T15:30:00Z"
    }
  ],
  "count": 3,
  "timestamp": "2026-08-13T16:45:00Z"
}
```

### Error Responses

**Status Code**: `500 Internal Server Error`

```json
{
  "status": "error",
  "message": "Failed to retrieve promotions",
  "errorCode": "PROMO_FETCH_ERROR",
  "timestamp": "2026-08-13T16:45:00Z"
}
```

### Notes

- Response includes only **active** promotions (isActive = true)
- Sorted by: **priority** (newest/featured first)
- **Expiration filtering**: Backend should filter out expired promotions server-side
- **Caching**: Response should be cacheable (consider ETag or Cache-Control header)
- **Rate limiting**: Not required for guest endpoint; but production should implement

---

## Endpoint 2: Get Available Time Slots

### Request

```http
GET /api/slots?days=7
```

**Query Parameters**:
- `days` (integer, optional): Number of days to fetch (default: 7, max: 14)

**Headers**:
```
Content-Type: application/json
```

**Authentication**: Not required for guest users

### Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "slot-001",
      "date": "2026-08-19",
      "time": "08:00",
      "displayTime": "08:00 AM",
      "duration": 30,
      "status": "available",
      "capacity": 1,
      "currentBookings": 0,
      "dayOfWeek": "Monday",
      "dayDisplayDate": "19/10"
    },
    {
      "id": "slot-002",
      "date": "2026-08-19",
      "time": "09:00",
      "displayTime": "09:00 AM",
      "duration": 30,
      "status": "available",
      "capacity": 1,
      "currentBookings": 0,
      "dayOfWeek": "Monday",
      "dayDisplayDate": "19/10"
    },
    {
      "id": "slot-003",
      "date": "2026-08-19",
      "time": "10:00",
      "displayTime": "10:00 AM",
      "duration": 30,
      "status": "booked",
      "capacity": 1,
      "currentBookings": 1,
      "dayOfWeek": "Monday",
      "dayDisplayDate": "19/10"
    },
    {
      "id": "slot-004",
      "date": "2026-08-19",
      "time": "11:00",
      "displayTime": "11:00 AM",
      "duration": 30,
      "status": "available",
      "capacity": 1,
      "currentBookings": 0,
      "dayOfWeek": "Monday",
      "dayDisplayDate": "19/10"
    },
    {
      "id": "slot-005",
      "date": "2026-08-20",
      "time": "08:00",
      "displayTime": "08:00 AM",
      "duration": 30,
      "status": "booked",
      "capacity": 1,
      "currentBookings": 1,
      "dayOfWeek": "Tuesday",
      "dayDisplayDate": "20/10"
    }
  ],
  "count": 35,
  "filteredCount": 5,
  "timestamp": "2026-08-13T16:45:00Z"
}
```

**Response Fields**:
- `count`: Total slots in database for requested period
- `filteredCount`: Number of slots returned (may be paginated or filtered)
- Slots are returned in **chronological order** (earliest date first, earliest time first per date)

### Error Responses

**Status Code**: `400 Bad Request` (invalid days parameter)

```json
{
  "status": "error",
  "message": "Invalid days parameter. Must be between 1 and 14.",
  "errorCode": "INVALID_DAYS_PARAM",
  "timestamp": "2026-08-13T16:45:00Z"
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "status": "error",
  "message": "Failed to retrieve available slots",
  "errorCode": "SLOTS_FETCH_ERROR",
  "timestamp": "2026-08-13T16:45:00Z"
}
```

### Notes

- Response includes slots regardless of booking status (UI filters for display)
- **Past times excluded**: Backend should not return times earlier than current time
- **Slot grouping**: Frontend groups by date; backend returns flat list
- **Status values**: "available", "booked", "maintenance"
- **Duration**: Typically 30 or 60 minutes; future-proof design allows variability
- **Caching**: Response should be cacheable (Cache-Control: max-age=300 recommended for 5-min TTL)
- **No pagination**: Assuming 7 days × 8 slots/day = 56 max slots, pagination not needed

---

## Integration Notes

### Client-Side Implementation

```typescript
// Fetch both endpoints in parallel
const [promotions, slots] = await Promise.all([
  fetch('/api/promotions').then(r => r.json()),
  fetch('/api/slots?days=7').then(r => r.json()),
]);

// Error handling
if (promotions.status !== 'success') {
  // Show error alert to user
}

if (slots.status !== 'success') {
  // Show error alert to user
}
```

### Timeout & Retry Strategy

- **Timeout**: 5 seconds per endpoint (user-perceivable latency cap)
- **Retry**: Exponential backoff (1s, 2s, 4s) for transient errors (5xx, network timeout)
- **Max retries**: 3 attempts before showing error to user

### Caching Strategy

- **Client-side**: Cache promotions for 10 minutes; slots for 5 minutes
- **Server-side**: Cache-Control headers recommended for 300s (5 min) TTL
- **Invalidation**: None required; periodic refresh acceptable for guest flow

### Booking Flow Integration

When user clicks "Book" on a time slot, redirect to booking page/modal with:
```
POST /api/bookings
{
  "slotId": "slot-001",
  "userId": "[authenticated user]"
}
```
*(This endpoint is out of scope for homepage feature; documented for reference)*

---

## API Versioning

- **Current version**: v1 (implied by `/api/`)
- **No version prefix required** for guest endpoints
- **Future**: If versioning needed, use `/api/v2/promotions` format

---

## Security Considerations

- **No authentication required**: Promotions and slots are public data
- **Rate limiting**: Recommended on backend to prevent abuse (e.g., 100 req/min per IP)
- **CORS**: Frontend should be added to CORS allowlist
- **Data validation**: Backend validates all inputs; frontend re-validates for robustness
- **PII**: No personal data in responses; appropriate for guest users
