# Quickstart: Validate Admin Dashboard + Booking Modal

## Prerequisites

- The repository is checked out at the `main` branch or the current feature branch.
- Dependencies are installed for both workspace packages:
  - `npm install`
- The backend and frontend packages are available in `backend/` and `frontend/`.

## Start the application

1. Start the backend service:

```bash
npm --workspace backend run dev
```

2. Start the frontend application:

```bash
npm --workspace frontend run dev
```

3. Open the application in a browser at the frontend dev server URL.

## Validate admin workflow

1. Open the Admin Login page.
2. Sign in with valid admin credentials.
3. Confirm the app redirects to the Admin Dashboard.
4. Navigate to the Bookings tab and verify bookings are grouped by state and sorted by tier.
5. Verify admin actions exist for confirming arrival, completing bookings after the allowed time, and canceling bookings.

## Validate booking modal workflow

1. As a logged-in customer, select an available timeslot from the booking schedule.
2. Open the Booking Modal.
3. Verify the modal requires phone, email, license plate, vehicle model, and vehicle type.
4. Select services and confirm that ineligible services are disabled when the selected timeslot is outside their allowed hours or when capacity is insufficient.
5. Confirm the final booking and verify the booking appears in the customer’s upcoming appointments.

## Expected outcomes

- The admin dashboard is accessible only after a successful sign-in.
- The booking modal enforces service availability and capacity rules before enabling confirmation.
- Admin actions are available and obey the defined business rules.
- The feature can be validated end-to-end using the contract descriptions in `contracts/api-endpoints.md` and the data definitions in `data-model.md`.
