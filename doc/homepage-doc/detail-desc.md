2. Detailed Component Descriptions
2.1. Header (Navbar)
Left Group: Displays the application Logo (AutoWash). Navigation links include Home (Active), Bookings (Locked for guests, might show a tooltip "Login required" on hover), and Promo.

Right Group: Since this is the unauthenticated Guest view, it prominently displays Sign In and Sign Up buttons instead of the User Avatar and Point Balance.

2.2. Hero Banner
A large, visually appealing billboard area at the top of the page.

Purpose: To immediately communicate the value proposition of the system (e.g., saving time, smart booking). It can contain a high-quality background image of a modern car wash and a clear Call-To-Action (CTA).

2.3. Promo Carousel
A horizontal sliding list (with < and > arrows) showcasing the active promotional campaigns configured by the Admin.

Even though guests cannot claim them yet, displaying them acts as an incentive to register (e.g., showing what perks await Member, Silver, Gold, or Platinum tiers).

2.4. BookingSchedule (Time Slot Grid)
Tier Logic Applied: Because the user is not logged in (Guest), the system enforces the default minimum booking window (Member tier = 7 days). The calendar will only show available dates for the next 7 days.

Visual Cues:

Available slots are clickable blocks (e.g., 08:00 AM).

Taken slots are grayed out or marked as [Booked].

The user can click an available slot to highlight their selection before submitting.

2.5. Book Button
Positioned directly below the schedule.

Action: When a guest selects a time slot and clicks BOOK NOW, the system intercepts the action and pops up the Sign In / Sign Up Modal over the current screen, prompting them to create an account or log in to finalize the reservation.

2.6. Footer
A standard bottom navigation area containing secondary links (Privacy Policy, Terms of Service, Support/Contact info) and copyright information.