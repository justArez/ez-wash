Detailed Description: Booking Page
The Booking Page is designed for authenticated users to manage their current upcoming appointments and review their past service history.

It can be access by clicking on the Booking in the header or Click on To my booking in Post Booking dialog

1. Header (Common Component)

The page utilizes the global authenticated header.

Left Group: Displays the Home icon, Bookings tab (active state), and Promo tab.

Right Group: Displays the logged-in user's Username and User Avatar.

2. Active Booking Section ("My Active Bookings")

This section acts as the primary focus upon loading the page, titled "My Active Bookings".

It displays a list of 3 to 5 currently active/upcoming bookings using a card layout.

Cancellation Logic & Warnings:

Users can cancel an active booking directly from its card.

Standard cancellation is allowed without penalty if performed more than 4 hours before the scheduled time slot.

If a user attempts to cancel within 4 hours of the time slot, the system permits the cancellation but displays a prominent [Warning] label on the UI.

Business Logic: The system tracks these late cancellations. If a user accumulates 3 warnings, they are automatically flagged as a "LOW PRIORITIED" user, which affects their future booking priority.

A [See All] button is positioned beneath the active bookings. Clicking this button expands the view to reveal the user's complete booking history.

3. History Section ("Historical Bookings Table")

This section is revealed upon clicking the "See All" button and is titled "Historical Bookings Table".

It utilizes a data table format to cleanly organize past records, with the following columns:

ID: The unique booking identifier.

Date: The date of the service.

Time: The time slot of the service.

Services: The specific package or services rendered (e.g., Vehicle, Platinum, Gold).

Status: The final state of the booking (e.g., Completed, Cancelled).

Points: Loyalty points earned or affected by this specific booking.

Pagination: To handle users with extensive histories, the table includes [Prev/Next] pagination controls at the bottom, alongside an items-per-page selector.

4. Footer (Common Component)

Standard global footer at the bottom of the page.