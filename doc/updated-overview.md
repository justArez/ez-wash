1. Common Components
Header: Acts as a Navigation bar divided into 2 groups:

Left Group: Home icon / Bookings (Only visible to logged-in users) / Promo.

Right Group: Guest state (Sign In / Sign up) OR Logged-in state (Username / User Avatar).

Footer: Contains general contact information and common links.

2. Reusable Components
Sign in / Sign up modal: Popup window for user authentication and registration.

List component: A generic component to display lists of different entities (bookings, promos, users, etc.).

Booking modal: Appears when a logged-in user clicks on an available timeslot. Allows users to switch between available slots.

Booking form: Contains data fields for the user to fill out:

Phone, Email, Vehicle License Plate.

Vehicle Model (Select box, supports "Type to add").

Vehicle Type (Motorbike/Car).

ServiceCheckbox (Dynamically Rendered): Displays a list of applicable service checkboxes based on the selected Vehicle Type and the Available Time Capacity (Timeslot). Automatically adds the selected service prices to the Total Cost.

Confirm booking button (Acts as the submit action).

3. Services & Timeslots Logic
Services Entity
Services are not hardcoded but flexibly managed via the Admin portal. Attributes include:

Basic Info: Service ID, Service Name, Description, Price, Status (Active/Inactive), Applicable Vehicle Type (Motorbike/Car/All).

Duration_Slots: The number of time blocks the service occupies (e.g., 1 slot = 30 mins. Standard Wash = 1 slot, Nano Coating = 4 consecutive slots).

Allowed_Timeslots: The specific operating hours during the day when the service is permitted (e.g., Engine Bay Wash is only accepted from 08:00 AM - 02:00 PM).

Validation Logic (at Booking Modal)
Time Window Check: If a user selects a timeslot that falls outside a service's Allowed_Timeslots, that specific service will be disabled (greyed out) and display a warning note.

Duration Capacity Check: The system automatically calculates the remaining consecutive available timeslots. If a user selects multiple services and the total Duration_Slots exceeds the actual available time before closing or the next booked appointment, the system will block the selection and display a capacity warning.

4. Pages Structure
4.1. Homepage
Header

Hero banner: Highlighting the brand's slogan and imagery.

Promo carousel: Slider showcasing active hot promotions.

BookingSchedule: A calendar grid displaying available washing slots to book. Features a "Book" button at the bottom (Clicking it opens the Sign in/Sign up modal for Guests, or the Booking modal for logged-in users).

Footer

4.2. Promo Page
Header

Active promo list: Display of ongoing promotions.

Promo by Tier: Promo cards categorized by membership tiers. Each card has a "Claim" button that only becomes active if the User has sufficient Points and meets the required Tier.

Footer

4.3. Booking Page (User View)
Header

Active booking section: Displays 3-5 upcoming appointments for the user.

Cancellation Logic: Bookings can be canceled penalty-free up to 4 hours before the timeslot. If canceled less than 4 hours prior, the system allows it but issues a Warning. A user can receive a maximum of 3 warnings before their account is flagged as LOW PRIORITIED (reduced priority in the physical service queue).

Contains a "See all" button.

History section: Clicking "See all" expands the section to display the entire wash history, complete with Pagination and an Items-per-page selector.

Footer

4.4. Admin Login
A simple login form for Administrators. Upon a successful login, it redirects to the Admin Dashboard.

4.5. Admin Dashboard
Left rail: Vertical navigation bar containing tabs: Dashboard / Bookings / Services / Promo / Tier Config / Users.

Dashboard tab: Displays business statistics and monitoring widgets.

Bookings tab: Displays all appointments.

Sorting Logic: Sorted by state (Pending/Wait to confirm -> Confirmed -> Completed/Cancelled). Within each state, prioritize sorting by TIER (highest first), then push users flagged as IS_LOW_PRIORITIED to the very bottom of the list.

Actions: Admin can confirm a customer's arrival, mark a booking as Complete (only permitted 10 minutes after the booked timeslot has passed), or Reject/Cancel the booking.

Services tab (New): Admin can CRUD services, categorize them by Vehicle Type, update Prices, define Duration_Slots (time blocks needed), and configure Allowed_Timeslots (operating hours constraints).

Promo tab: Admin can CRUD Promos, assign Promos to specific Tiers, and adjust the Point redemption price. Includes a selection box to choose and activate the desired Tier Set.

Tier config tab: Admin can CRUD Tier Sets. A Tier Set must contain at least 2 Tiers along with their required point Thresholds. Admins can create multiple Tier Sets but can only set one as the Active Tier Set for the entire application.

Users tab: Admin can CRUD Users. Displays User info: Fullname, Email, Phone, most active vehicle, and current Points. Admins can manually add or subtract points to resolve customer issues.