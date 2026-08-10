# Requirements Specification Document: Smart Automated Car Wash Management System 
**(with Advance Booking & Loyalty Program)**

- **Submitted by:** VanTTN2
- **Objective:** Integrate AI and CRM technologies into the automated car wash management system to enhance customer experience, optimize operations, and increase the customer retention rate (targeted at a 45% boost).
- **Important Note:** The system **DOES NOT** integrate online payment services or refund management.

---

## 1. Main Entities

The system consists of the following core entities to structure the database schema:

* **User (Customer):** Contains customer information (Phone, Email, Fullname, Avatar, Point Balance, Current Tier, IS_LOW_PRIORITIZED flag, Warning Count).
* **Customer's Vehicle:** Customer's vehicle details (License Plate, Vehicle Model, Type: Motorbike/Car). Linked to the Customer.
* **Tier Set & Tier Config:** Membership tier configurations (Tier Name, Point Threshold, Booking window privileges).
* **System's Promotion (Promo):** System promotions (Name, Description, Redemption point price, Tier requirement).
* **Booking / Wash History:** Booking and wash history (Booking ID, Customer ID, Vehicle ID, Time Slot, Services, Total Cost, Status: Pending/Confirmed/Completed/Cancelled, Applied Promo/Perks).
* **Services:** Car wash services and their corresponding prices.

---

## 2. Functional Requirements

### 2.1. Loyalty Engine
* **Tracking:** Track and store points, amount spent, and number of visits.
* **Tier Management:** Auto-upgrade or downgrade membership tiers based on monthly reviews.
* **Redemption:** Allow users to redeem points for discounts, free washes, or add-on services.
* **Expiration:** Points will automatically expire after 12 months.

### 2.2. Customer Features
* **Account Linking:** Link accounts via Phone number and License plate.
* **View Information:** View point balance, current tier, and wash history.
* **Tier-based Booking Window:** 
  * Member: Up to 7 days in advance.
  * Silver: Up to 10 days in advance.
  * Gold: Up to 12 days in advance.
  * Platinum: Up to 14 days in advance.
* **Priority Queue:** Higher tiers get prioritized access to the service queue.
* **Auto-apply:** Automatically apply tier perks at checkout.

### 2.3. Admin Features
* **Config:** Configure tier rules, point rates, and perks for each tier.
* **Promotions:** Run targeted promotion campaigns (e.g., "Target Silver+ members only").
* **Violation Handling:** Manage and track customers who repeatedly violate the booking cancellation policy (`LOW_PRIORITIZED`).

---

## 3. UI/UX Structure & Components

### 3.1. Common Components
* **Header (Navbar):** 
  * Left Group: Home icon / Bookings (only for logged-in users) / Promo.
  * Right Group: Guest state (Sign In / Sign Up) OR Logged-in state (Username / User Avatar).
* **Footer:** Contact links, terms of service, etc.
* **Modals & Lists:** Sign in / Sign up Modal, Booking Modal, List Component (for displaying entity lists).
* **Booking Form:** Input fields for Phone, Email, License Plate, Vehicle Model (select box with 'type to add' ability), Type (Car/Motorbike), Service Checkbox list (adds price to total cost), and a Confirm Booking button (submit action).

### 3.2. Pages Structure
1. **Homepage:**
   * Header.
   * Hero banner.
   * Promo carousel (Active hot promos).
   * BookingSchedule: View available washing slots based on User Tier (Guests default to 7 days). A 'Book' button at the bottom opens the Auth Modal or Booking Form.
   * Footer.
2. **Promo Page:**
   * Header.
   * Display current points and tier.
   * Promo list grouped by Tier. Each promo card has a "Claim" button (only enabled if the user has enough points and sufficient Tier).
   * Footer.
3. **Booking Page:**
   * Header.
   * *Active Bookings* section (showing 3-5 upcoming bookings).
   * **Cancellation Logic:**
     * Cancel > 4 hours before time slot: Normal cancellation.
     * Cancel < 4 hours before time slot: User can still cancel but a warning is shown. Max 3 warnings allowed per user.
     * Exceeding 3 warnings: Mark the account as a `LOW_PRIORITIED` user.
   * "See All" button: Expands the section to show all historical bookings with pagination features.
   * Footer.
4. **Admin Login:** Simple login form for administrators. Redirects to Dashboard upon success.
5. **Admin Dashboard:**
   * **Left Rail (Nav bar):** Dashboard / Bookings / Promo / Tier Config / Users.
   * **Dashboard Tab:** Business stat widgets for monitoring performance.
   * **Bookings Tab:** List of all bookings.
     * *Sort logic:* Sort by state (Pending -> Confirmed -> Completed/Cancelled). For each state, sort by TIER (Highest to Lowest), then push `IS_LOW_PRIORITIED` users to the bottom.
     * *Actions:* Admin can confirm a booking, mark it as complete (10 minutes after the booked timeslot), or Reject/Cancel the booking.
   * **Promo Tab:** CRUD Promos, Assign promos by Tier, Adjust Promo point price.
   * **Tier Config Tab:** CRUD Tier Sets. A set must have at least 2 Tiers with point thresholds. Admin can create multiple sets and set one as the "Active" set for the entire app.
   * **Users Tab:** CRUD Users. View info (Fullname, email, phone, most active vehicle, points). Admin can manually add or subtract points.

---

## 4. Detailed System Flows

### 4.1. Customer Flow
1. Access the homepage. If Guest, view the default 7-day schedule. If Logged-in, view the schedule based on Tier limits (e.g., 12 days for Gold).
2. Click on an available timeslot on the BookingSchedule.
3. The system opens the Booking Modal:
   * Fill in contact and vehicle details, then select services (Auto-fill if user data exists).
   * The system calculates the Total Cost and displays auto-applied Perks (e.g., Priority Queue).
4. Click Confirm -> Creates a Booking (Status: `PENDING`). Redirects to Booking Page.
5. User actions on the **Booking Page**:
   * Proactive Cancellation: The system checks the timeframe. If `< 4 hours`, a warning is triggered. If the warning count reaches 3, the user is permanently marked as `LOW_PRIORITIED`.
6. User actions on the **Promo Page**:
   * Redeem points for Promos (Claim).
   * Apply the claimed promo to their next booking.

### 4.2. Admin Flow
1. Log in to the Admin Dashboard.
2. Monitor the **Bookings Tab**:
   * The sorting logic automatically pushes VIPs (high tier, no violations) to the top of the queue and penalizes `LOW_PRIORITIED` customers by pushing them to the bottom.
3. Actual Station Operations:
   * Customer arrives: Admin changes status from `PENDING` to `CONFIRMED`.
   * Wash completed (or 10 mins passed): Admin marks as `COMPLETED`.
   * Customer does not arrive (No-show): Admin selects `CANCEL/REJECT`.
4. Adjust strategies in the **Promo Tab & Tier Config Tab**:
   * Update required point thresholds for tier upgrades.
   * Launch targeted promos (e.g., assign specific discounts to the Platinum tier selection box).