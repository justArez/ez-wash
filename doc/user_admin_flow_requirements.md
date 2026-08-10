# User and Admin Flow Requirements

**Updated**: 2026-08-11
**Scope**: Homepage, customer booking/promo flows, and admin dashboard management flows

## 1. Common layout

### Header
- The header must act like a navbar with two groups.
- Left group:
  - Home icon / Home
  - Bookings (only visible when a user is logged in)
  - Promo
- Right group:
  - Browsing as Guest (when not logged in)
  - Sign In
  - Sign Up
- When a user is logged in, the right group should show:
  - Username
  - User avatar

### Footer
- Every page must include a footer section with:
  - Branding or product name
  - Navigation quick links
  - A short customer support or help note

## 2. Shared components

### Sign In / Sign Up modal
- A reusable modal must support both sign in and sign up flows.
- Sign In should allow an existing user to enter credentials or phone information.
- Sign Up should allow a new user to register with phone, email, vehicle details, and loyalty preferences.

### List component
- Create a shared list component for rendering any entity list.
- It should support a title, subtitle, item count, and a flexible item renderer.

### Booking modal
- The booking modal appears when a logged-in user clicks on an available slot.
- It must allow switching between available timeslots.

### Booking form
- The booking form must collect:
  - Phone
  - Email
  - Vehicle license plate
  - Vehicle model (select box with type-to-add)
  - Vehicle type (motorbike / car)
  - A service checkbox list
- The form must calculate and display the total cost.
- The form must include a Confirm booking button to submit.

## 3. Pages

### Homepage
- Page structure:
  - Header
  - Hero banner
  - Promo carousel
  - Booking schedule section
  - Footer

- Booking schedule section:
  - Show available washes and available timeslots.
  - Each slot should have a Book button.
  - For guests, Book should open the Sign In / Sign Up modal.

### Promo Page
- Page structure:
  - Header
  - Active promo list
  - Promo by tier section
  - Footer

- Each promo card should:
  - show promo details
  - indicate required points and eligible tiers
  - render a Claim button only if the user has enough points and tier access

### Booking Page
- Page structure:
  - Header
  - Active booking section showing 3–5 current bookings
  - See all button to expand the booking history
  - Footer

- Booking behavior:
  - Users can cancel bookings up to 4 hours before the slot.
  - If cancellation is attempted within 4 hours, show a warning.
  - Track warning cancellations and mark users as LOW PRIORITIZED after 3 warnings.

- History behavior:
  - Show all bookings when See all is clicked.
  - Include pagination controls and items-per-page selection.

### Admin Login
- Simple admin login form.
- Redirect to Admin Dashboard on success.

### Admin Dashboard
- Page structure:
  - Header (admin context)
  - Left rail vertical navigation with tabs:
    - Dashboard
    - Bookings
    - Promo
    - Tier Config
    - Users
  - Main content area for the selected tab
  - Footer

- Dashboard tab:
  - Show business stats widgets such as active bookings, promo activity, tier distribution, and user engagement.

- Bookings tab:
  - Show all bookings sorted by state:
    - Pending / Waiting confirmation
    - Confirmed
    - Completed / Cancelled
  - Further sort bookings by tier and by low-priority status.
  - Admin can confirm bookings, mark bookings as complete after the timeslot, and reject or cancel bookings.

- Promo tab:
  - Admin can CRUD promos.
  - Admin can assign promos to tiers.
  - Admin can adjust promo point prices.
  - The tier set can be chosen from a tier set selection.

- Tier Config tab:
  - Admin can CRUD tier sets.
  - Each tier set must contain at least two tiers and point thresholds.
  - Admin can create multiple tier sets and choose one active set for the entire app.

- Users tab:
  - Admin can CRUD users.
  - Each user row should display:
    - Full name
    - Email
    - Phone
    - Most active vehicle
    - Points
  - Admin can add or subtract points from a user.

## 4. Implementation notes
- UI must separate guest browsing from logged-in customer flows.
- The loualty experience should be clearly laid out across homepage, promo, and bookings.
- Admin experience must be tabbed and centered on operational control.
- Reuse shared components where possible for lists, forms, and modals.
