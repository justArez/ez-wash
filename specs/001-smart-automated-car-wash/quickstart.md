# Quickstart: Validate Smart Automated Car Wash

## Prerequisites
- Node.js installed for the frontend and root workspace.
- Bun installed for the backend development server.
- Dependencies installed from the repository root and backend/frontend subfolders.

## Setup
1. From the repository root:
   - `npm install`
2. From the backend folder:
   - `cd backend`
   - `bun install`
3. From the frontend folder:
   - `cd frontend`
   - `npm install`

## Run the Feature Locally
1. Start the backend service:
   - `cd backend`
   - `bun run dev`
2. Start the frontend app:
   - `cd frontend`
   - `npm run dev`
3. Open the Vite URL in the browser and use the loyalty flow UI.

## Validation Scenarios
- Link a new loyalty account using a license plate and phone number.
- Verify the dashboard displays tier status, points balance, rewards suggestions, and the next eligible booking date.
- Create a booking inside the allowed tier window and confirm it is accepted.
- Attempt a booking outside the allowed window and confirm the response returns the next eligible date.
- Confirm eligible tier perks are surfaced on the dashboard and booking flow.
- Redeem a reward and confirm the balance and history update.
- Update tier configuration and verify that future evaluations use the new rules.

## Expected Outcomes
- The dashboard reflects the customer tier and current booking allowance.
- Personalized reward suggestions appear based on tier and vehicle profile.
- Blocked bookings provide a clear next-eligible date.
- Reward redemption and point history remain visible and consistent.
- Admin tier changes apply to future evaluations only.
