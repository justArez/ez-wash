# Feature Specification: Homepage UI Enhancement with shadcn

**Feature Branch**: `004-homepage-shadcn-redesign`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "base on the wireframe image in @file:homepage-wireframe.png and these spec markdown file @file:detail-desc.md @file:detail-desc.md, use shadcn as main UI components lib, enhance the current homepage UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest User Views Available Washing Slots (Priority: P1)

A guest user lands on the homepage and needs to quickly see available car wash slots for the next 7 days. The enhanced UI should display time slots clearly with visual distinction between available and booked slots, using modern UI components from shadcn for better visual hierarchy and usability.

**Why this priority**: This is the core value proposition - allowing guests to browse availability without login is essential for conversion and user engagement.

**Independent Test**: Guest user can view the complete 7-day slot calendar, identify available slots, and trigger the booking flow by clicking "Book Now".

**Acceptance Scenarios**:

1. **Given** guest user is on the homepage, **When** page loads, **Then** a 7-day calendar of available washing slots is displayed in a single horizontal row on desktop (7 day columns), wrapping to 3-4 days per row on tablet and 1 day per row on mobile, with clear visual distinction between available and booked slots using shadcn Card and Badge components
2. **Given** guest user sees the slots section, **When** hovering over an available slot, **Then** the slot card highlights with visual feedback indicating it is clickable
3. **Given** guest user is on the slots section, **When** clicking an available time slot card, **Then** the Sign In/Sign Up modal is triggered via shadcn Dialog component with the selected slot pre-stored for booking continuation after authentication

---

### User Story 2 - Guest User Discovers Promotions (Priority: P1)

A guest user browses the homepage and needs to discover active promotions and rewards program offers. The enhanced UI should showcase promotions in an engaging carousel format using shadcn Carousel component for better visual presentation and accessibility.

**Why this priority**: Promotions drive conversion and encourage user engagement; the carousel must be visually compelling to grab attention.

**Independent Test**: Guest user can navigate through the promotions carousel, see promotion details (discount percentage, loyalty points, terms), and access full promotion details.

**Acceptance Scenarios**:

1. **Given** guest user lands on homepage, **When** page renders, **Then** a prominent "Hot Promotions" section displays with top active promotions in a carousel using shadcn Carousel component; carousel auto-advances every 30 seconds
2. **Given** promotions carousel is displayed, **When** user clicks left/right navigation arrows, **Then** carousel transitions to next/previous promotions and resets the 30-second auto-advance countdown
3. **Given** promotion card is visible, **When** user clicks "View Promo" button, **Then** full promotion details are displayed (discount percentage, loyalty points required, expiry date, terms) in a shadcn Dialog modal on the homepage

---

### User Story 3 - Guest User Engages with Hero Banner CTA (Priority: P1)

A guest user visits the homepage and needs a clear, compelling hero banner that communicates the value proposition and encourages them to book a wash. The banner should feature a strong call-to-action using shadcn Button component.

**Why this priority**: The hero banner is the first visual element and sets expectations; a weak CTA directly impacts conversion rates.

**Independent Test**: Guest user can clearly read the value proposition message and click the primary CTA to initiate the booking process.

**Acceptance Scenarios**:

1. **Given** guest user lands on homepage, **When** page fully loads, **Then** hero banner displays prominently with message "Smart Automated Wash - Book Ahead, Skip the Line!" and a primary CTA button using shadcn Button
2. **Given** hero banner is visible, **When** user reads the banner copy, **Then** the value proposition is clear and compelling within 3 seconds
3. **Given** hero banner CTA button is visible, **When** user clicks it, **Then** they are redirected to booking flow or Sign In modal appears

---

### User Story 4 - Navigation Between Key Sections (Priority: P2)

A guest user needs intuitive navigation between homepage sections (Home, Bookings, Promos) using a modern navigation bar. The enhanced UI should use shadcn Navigation Menu or custom Header component with responsive design.

**Why this priority**: Smooth navigation improves user experience and reduces bounce rates; essential for accessibility.

**Independent Test**: Guest user can navigate between sections via the header navigation without confusion or broken links.

**Acceptance Scenarios**:

1. **Given** user is on homepage, **When** header is visible, **Then** navigation menu displays "Home | Bookings (Guest) | Promo | Sign In | Sign Up" links
2. **Given** user clicks a navigation link, **When** link is activated, **Then** page smoothly transitions to the target section with visual indication of current page
3. **Given** user views on mobile device, **When** viewport is < 768px, **Then** navigation collapses into a hamburger menu using shadcn Sheet component

---

### User Story 5 - Responsive Design Across Devices (Priority: P2)

A guest user accesses the homepage from desktop, tablet, or mobile device. The enhanced UI should be fully responsive using shadcn's responsive utilities and Tailwind CSS breakpoints.

**Why this priority**: Mobile users represent 50%+ of web traffic; responsive design is non-negotiable for modern web applications.

**Independent Test**: Homepage displays correctly and maintains usability across all device sizes (mobile, tablet, desktop) with no content overflow or broken layouts.

**Acceptance Scenarios**:

1. **Given** user views homepage on mobile (< 375px), **When** page loads, **Then** all content is readable without horizontal scrolling, time slots display 1 per row, and touch targets are min 44px
2. **Given** user views homepage on tablet (768px), **When** page renders, **Then** layout adapts gracefully with 3-4 day columns, time slots wrap to multiple rows
3. **Given** user views homepage on desktop (> 1024px), **When** page renders, **Then** all 7 days display in a single horizontal row with 4-column slot display per day, and carousel displays 3 promotions at once

---

### Edge Cases

- What happens when no slots are available in a 7-day period? (Display "No slots available" message with shadcn Alert component)
- What happens when promotions carousel has only 1 promotion? (Disable carousel navigation; display single card only)
- What happens when page is loading and data hasn't arrived? (Show shadcn Skeleton placeholders for slots and promotions)
- What happens when a user has an extremely slow internet connection? (Implement progressive image loading for hero banner; skeleton loaders for content)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Homepage MUST display a hero banner with value proposition text and a primary CTA button using shadcn Button component
- **FR-002**: Homepage MUST display available washing slots for the next 7 days organized by day, with visual distinction between available and booked slots using shadcn Card and Badge components
- **FR-003**: Homepage MUST display active promotions in a carousel format using shadcn Carousel component with previous/next navigation controls; carousel auto-advances every 30 seconds through top promotions, resetting the auto-scroll countdown when user manually clicks navigation arrows
- **FR-004**: Each promotion card MUST display: promotion name, discount percentage, loyalty points value, and "View Promo" call-to-action button
- **FR-005**: Each time slot MUST be clickable and display the time in HH:MM AM/PM format and show booking status (available/booked) with distinct visual styling using shadcn Badge; clicking an available slot triggers the Sign In/Sign Up modal
- **FR-006**: Homepage navigation MUST include links to: Home, Bookings (Guest), Promos, Sign In, and Sign Up, implemented as a responsive header using shadcn components
- **FR-007**: All interactive elements (buttons, links, cards) MUST have hover states and visual feedback using shadcn's built-in interactions
- **FR-008**: Homepage MUST be fully responsive and adapt to mobile (< 375px), tablet (768px), and desktop (> 1024px) viewports using Tailwind CSS breakpoints
- **FR-009**: Page MUST load content progressively with skeleton loaders using shadcn Skeleton component for slots and promotions while data is fetching
- **FR-010**: Footer MUST display links: Contact Us, Terms of Service, Privacy Policy, FAQ using shadcn components
- **FR-011**: Homepage MUST automatically refresh available time slots every 5 minutes (300 seconds) to reflect recently booked slots and slot availability changes; refreshes occur silently in the background without blocking user interaction
- **FR-012**: Slots section MUST include a manual reload icon button (refresh/reload symbol) that allows users to immediately refresh slots; clicking the reload button resets the 5-minute auto-refresh countdown timer

### Key Entities

- **Hero Banner**: Text content, CTA button label and action, background image/color
- **Promotion Card**: Promotion name, discount percentage, loyalty points, expiry date, "View Promo" action
- **Time Slot Card**: Date (day/date), time (HH:MM format), booking status, availability indicator
- **Navigation Item**: Label, href/action, active state
- **Responsive Breakpoint**: Mobile (< 375px), Tablet (768px), Desktop (> 1024px) with corresponding column counts and component sizing

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view available slots and identify a preferred time slot within 15 seconds of page load
- **SC-002**: Promotions carousel maintains smooth animations with no jank (60 FPS) on modern devices
- **SC-003**: Page load time is under 3 seconds on 4G connection, with above-the-fold content visible within 1.5 seconds
- **SC-004**: Mobile layout maintains usability with touch targets minimum 44x44px and no horizontal scrolling
- **SC-005**: 95% of users successfully click through to booking flow without encountering broken links or missing elements
- **SC-006**: Accessibility score (Lighthouse) is 90+ with proper ARIA labels, semantic HTML, and keyboard navigation support via shadcn components
- **SC-007**: All shadcn components render consistently across major browsers (Chrome, Firefox, Safari, Edge) on their latest versions

## Assumptions

- Existing backend APIs for slots and promotions are stable and performant (< 500ms response time)
- shadcn/ui library is already installed in the frontend project (version 0.15+)
- Design system uses Tailwind CSS for styling, which is compatible with shadcn
- Guest users do not require continuous real-time slot updates; automatic refresh every 5 minutes is acceptable to show recently booked slots
- Mobile-first design approach is preferred; desktop experience is an enhancement
- Authentication system (Sign In/Sign Up modals) already exists and will be integrated via Dialog component
- Hero banner image/background is provided by CMS or static asset; no image processing required
- Promotion data is fetched from existing backend API (/api/promotions endpoint)
- Time slot data is fetched from existing backend API (/api/slots endpoint with 7-day filter)

## Clarifications

### Session 2026-08-13

- Q: When a guest user clicks "Book Now" on an available time slot, should the system navigate to a booking details page first, or immediately display the Sign In/Sign Up modal? → A: Remove separate "Book Now" button; clicking on the time slot card directly triggers the Sign In/Sign Up modal immediately (Option A - lazy authentication with slot pre-selected)
- Q: When a guest user clicks "View Promo" on a promotion card, should the full promotion details display in a modal dialog on the homepage, or should they navigate to a dedicated promotions details page? → A: Display full promotion details in a shadcn Dialog modal on the homepage (Option A)
- Q: Should the homepage automatically refresh the available time slots if a user leaves the page open for an extended period, or should slots only refresh when the user manually refreshes the page? → A: Auto-refresh slots every 5 minutes (Option A with 5 min interval)
- Q: Should the promotion carousel display show 3 fixed promotions at all times on desktop, or should it automatically cycle/advance to show different promotions at a set interval? → A: Auto-play carousel (Option A): auto-advance every 30 seconds (updated from 10s) through top 10 promotions with manual arrow buttons; reset auto-scroll countdown on user arrow interaction
- Q: For the 7-day time slot calendar layout on desktop, should all 7 days display in a single horizontal row or should days wrap to multiple rows for better readability? → A: Single horizontal row for 7 days on desktop with wrap to 3-4 days on tablet, 1 per row on mobile (Option A)

### Post-Clarification Updates (2026-08-13)

- Added manual reload button (refresh icon) in slots section to allow immediate refresh and reset countdown timer
- Adjusted carousel auto-advance interval from 10 seconds to 30 seconds for better user engagement balance
