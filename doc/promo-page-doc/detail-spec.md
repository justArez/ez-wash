Detailed Component Descriptions
Header (Navbar):

Functions as a standard navigation bar divided into two groups.

Left Group: Displays the logo, Home, Bookings (visible because the user is logged in), and Promo (highlighted as active).

Right Group: Displays the logged-in user's Username and User Avatar, alongside their current point balance to provide immediate context for claiming promos.

Global Active Promo List:

A visually distinct banner or horizontal scrolling list at the top of the page.

Displays ongoing, system-wide promotional campaigns that are currently active for all users.

Your Promos (Claimed):

A dedicated section showing the rewards the user has successfully redeemed.

Includes a clear Call-To-Action (e.g., "Use Now") that can redirect the user straight to the Booking Modal to apply their discount.

Acclaimable Promos:

Organizes available promotions into categories based on membership Tier.

Dynamic Button Logic: The primary button on each promo card explicitly states its point price (e.g., "300 pts"). When a user hovers over the button, the text dynamically shifts to "Claim".

Validation Check: The system actively checks the current logged-in user's Tier and point balance against the promo's requirements. If the user lacks sufficient points or does not meet the Tier threshold, the claim button is disabled and visually greyed out (e.g., displaying "LACKS TIER" or "INSUFFICIENT PTS").

Footer:

A standard bottom navigation area for the application.