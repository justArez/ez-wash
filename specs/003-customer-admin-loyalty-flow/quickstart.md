# Quickstart: Customer & Admin Loyalty Flow

## Prerequisites

- Clone the `Ez Wash` repository and install dependencies for both frontend and backend.
- Ensure the feature plan is in `specs/003-customer-admin-loyalty-flow`.
- Confirm the admin token is configured in environment variables or defaults to `admin-secret`.

## Run the backend

```bash
cd e:\Code\SWP391_3W\backend
npm install
bun run --watch src/index.ts
```

## Run the frontend

```bash
cd e:\Code\SWP391_3W\frontend
npm install
npm run dev
```

## Validate the customer flow

1. Open the frontend in a browser.
2. Verify the homepage displays guest navigation with "Keep browsing as Guest" and "Login / Sign Up".
3. Click "Login / Sign Up" and confirm the login modal opens.
4. Authenticate as a customer and verify the header changes to Home, Bookings, and Promo.
5. Click Bookings to open the active bookings modal, then click See more to navigate to the Bookings page.
6. Confirm the Bookings page shows active bookings plus booking history and point history.
7. Click Promo and verify the Promo page shows active promotions and tier-based redemption organization.

## Validate the admin flow

1. Use an admin authorization header or `x-admin-token` to access admin routes.
2. Verify the Admin Home page is accessible after login and sidebar sections include Dashboard, Promo, Tier Config, Bookings, and Users.
3. Confirm admin promo management supports create, update, and delete of promotions.
4. Confirm admin tier management supports create, update, and delete of tiers.
5. Verify the bookings screen can sort bookings by Wait for confirm, Confirmed, and Finished/Closed.
6. Verify the users screen lists full name, username, most active vehicle, email if present, and points.
7. Confirm admins can add or subtract points and that point adjustments generate audit log entries.
8. Confirm user deletion is soft and that historical profile data remains preserved.

## Expected Outcomes

- Customer pages are navigable and present the loyalty features without errors.
- Admin screens support the required management operations and preserve audit history for sensitive actions.
- The system maintains the existing web application architecture with no heavy new dependencies.
