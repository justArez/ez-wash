# Data Model: Homepage UI Enhancement with shadcn

**Feature**: Homepage UI Enhancement with shadcn  
**Date**: 2026-08-13  
**Scope**: Define entities, relationships, and state for homepage UI components

## Entity Definitions

### 1. Promotion

Represents an active promotion or reward offer displayed in the carousel.

**Fields**:
- `id` (string): Unique identifier for the promotion
- `name` (string): Display name (e.g., "20% OFF GOLD")
- `description` (string): Short promotion description
- `discountPercentage` (number): Discount as percentage (e.g., 20 for 20%)
- `loyaltyPointsRequired` (number): Points needed to redeem (e.g., 500)
- `loyaltyPointsValue` (number): Points earned or bonus value (e.g., 100 bonus points)
- `expiryDate` (ISO 8601 string): Expiration date (e.g., "2026-12-31T23:59:59Z")
- `category` (enum): Type of promotion - "discount" | "points_bonus" | "new_member"
- `terms` (string): Full terms and conditions (hidden, shown in detail modal)
- `isActive` (boolean): Whether promotion is currently available
- `createdAt` (ISO 8601 string): Promotion creation timestamp
- `updatedAt` (ISO 8601 string): Last modification timestamp

**Validation Rules**:
- `id`: Required, non-empty string, unique per request
- `name`: Required, length 5-100 chars, no HTML/JS injection
- `discountPercentage`: Range 0-100, integer
- `loyaltyPointsRequired`: Non-negative integer
- `expiryDate`: Must be after current date/time
- `isActive`: Only active promotions displayed in carousel

**Relationships**:
- Referenced by: PromotionCard component
- Source: Backend API `/api/promotions` (guest-visible endpoint)

---

### 2. TimeSlot

Represents an available or booked car wash time slot for a specific date/time.

**Fields**:
- `id` (string): Unique identifier for the slot
- `date` (ISO 8601 string): Date of the slot (e.g., "2026-08-19")
- `time` (string): Time in 24-hour format (e.g., "08:00" or "08:00:00")
- `displayTime` (string): Formatted time for UI (e.g., "08:00 AM")
- `duration` (number): Slot duration in minutes (typically 30 or 60)
- `status` (enum): "available" | "booked" | "maintenance"
- `capacity` (number): Max bookings for this slot (typically 1 or more for batch booking)
- `currentBookings` (number): Current number of bookings
- `dayOfWeek` (string): Day name (e.g., "Monday")
- `dayDisplayDate` (string): Formatted date (e.g., "19/10")

**Computed Fields** (derived in UI layer):
- `isAvailable` (boolean): `status === "available" && currentBookings < capacity`
- `slotLabel` (string): `"${dayOfWeek} (${dayDisplayDate})"` for day header
- `timeLabel` (string): `displayTime` for slot display

**Validation Rules**:
- `date`: Valid ISO 8601 date, no past dates
- `time`: Valid 24-hour time format (00:00-23:59)
- `status`: Enum value (case-sensitive)
- `currentBookings`: 0 ≤ currentBookings ≤ capacity
- `duration`: Positive integer (15, 30, 60 minutes typical)

**Relationships**:
- Referenced by: SlotCard component (within SlotCalendar)
- Grouped by: Date (day column) then time (row)
- Cascading from: Backend API `/api/slots?days=7` (guest-visible endpoint)

**State Transitions**:
```
available ─[user clicks]─> opens Sign In/Sign Up modal
booked ──────────────────> disabled UI state
maintenance ──────────────> gray out, show "Maintenance" badge
```

---

### 3. NavigationItem

Represents a navigation link in the header.

**Fields**:
- `id` (string): Unique identifier ("home", "bookings", "promo", etc.)
- `label` (string): Display text (e.g., "Home", "Bookings")
- `href` (string): URL or route (e.g., "/", "/bookings", "/promo")
- `isActive` (boolean): True if current route matches this item
- `visibleFor` (enum): "all" | "guest" | "logged_in" - visibility rule
- `icon` (React.ReactNode, optional): Icon component for mobile nav
- `requiresAuth` (boolean): If true, shows Sign In prompt for guests

**Validation Rules**:
- `id`: Required, non-empty string, unique per nav
- `label`: Required, length 1-50 chars
- `href`: Must be valid URL or relative path
- `visibleFor`: Enum value
- `requiresAuth`: Boolean; if true, href may be empty

**Relationships**:
- Referenced by: Header component
- Used in: Desktop horizontal nav + Mobile drawer nav (Sheet)

**Examples**:
```javascript
[
  { id: "home", label: "Home", href: "/", visibleFor: "all", requiresAuth: false },
  { id: "bookings", label: "Bookings", href: "/bookings", visibleFor: "logged_in", requiresAuth: true },
  { id: "promo", label: "Promo", href: "/promo", visibleFor: "all", requiresAuth: false },
  { id: "signin", label: "Sign In", href: "", visibleFor: "guest", requiresAuth: true },
  { id: "signup", label: "Sign Up", href: "", visibleFor: "guest", requiresAuth: true },
]
```

---

### 4. HeroBanner

Represents the hero section content and call-to-action.

**Fields**:
- `heading` (string): Main heading (e.g., "Smart Automated Wash - Book Ahead, Skip the Line!")
- `subheading` (string, optional): Secondary text
- `backgroundImage` (string, optional): URL to background image or gradient CSS
- `ctaLabel` (string): Button text (e.g., "Book a Wash")
- `ctaAction` (function): Callback when CTA clicked (e.g., openBookingFlow, openSignIn)
- `theme` (enum): "light" | "dark" - background theme for text contrast

**Validation Rules**:
- `heading`: Required, length 10-200 chars
- `ctaLabel`: Required, length 5-50 chars
- `backgroundImage`: Optional; if provided, must be valid URL
- `theme`: Enum value

**Rendering**:
- Displays as a full-width section with background image/color
- Heading + subheading centered
- CTA button positioned below text or bottom-right
- Responsive: Stack vertically on mobile, horizontal layout on desktop

**Relationships**:
- Part of: HomePage component
- Data source: Hardcoded or CMS (not from API)

---

### 5. FooterLink

Represents a link in the footer.

**Fields**:
- `id` (string): Unique identifier ("contact", "tos", "privacy", "faq")
- `label` (string): Display text (e.g., "Terms of Service")
- `href` (string): URL (e.g., "/terms", "mailto:contact@ez-wash.com")
- `openInNewTab` (boolean): If true, opens in new window/tab

**Validation Rules**:
- `id`: Required, non-empty string, unique per footer
- `label`: Required, length 1-50 chars
- `href`: Must be valid URL or mailto: or tel: link
- `openInNewTab`: Boolean

**Relationships**:
- Referenced by: Footer component
- Data source: Hardcoded or CMS

**Examples**:
```javascript
[
  { id: "contact", label: "Contact Us", href: "mailto:support@ez-wash.com", openInNewTab: false },
  { id: "tos", label: "Terms of Service", href: "/terms", openInNewTab: false },
  { id: "privacy", label: "Privacy Policy", href: "/privacy", openInNewTab: false },
  { id: "faq", label: "FAQ", href: "/faq", openInNewTab: false },
]
```

---

## State Management

### Page-Level State (HomePage)

```typescript
interface HomePageState {
  // Promotions
  promotions: Promotion[];
  isLoadingPromotions: boolean;
  promotionError: Error | null;

  // Time Slots
  slots: TimeSlot[];
  isLoadingSlots: boolean;
  slotError: Error | null;

  // UI State
  isSignInModalOpen: boolean;
  isSignUpModalOpen: boolean;
  selectedSlot: TimeSlot | null;
}
```

### Component-Level State

**Carousel Component**:
- `currentSlide` (number): Index of visible promotion
- `maxSlides` (number): Total promotions count
- `isDragging` (boolean): True while user dragging carousel

**Mobile Navigation (Sheet)**:
- `isOpen` (boolean): Drawer open/closed state

---

## Data Flow Diagram

```
HomePage (fetches data)
    ├── Hero Banner (static data)
    ├── Header (navigation items)
    ├── Carousel
    │   └── Promotion[] (from /api/promotions)
    │       └── PromotionCard × N
    │           ├── Badge (discountPercentage)
    │           └── Button (View Promo)
    ├── SlotCalendar
    │   └── TimeSlot[] (from /api/slots?days=7)
    │       └── Grouped by date
    │           └── SlotCard × N per day
    │               ├── Badge (status)
    │               └── Button (Book / disabled)
    ├── Footer (links hardcoded)
    └── Dialogs (modals, triggered on interaction)
        ├── SignInModal
        ├── SignUpModal
        └── PromotionDetailsModal
```

---

## Validation & Error Handling

### Slot Validation

- **Invalid time format**: Filter out; log warning
- **Past dates**: Exclude from display
- **Zero capacity slots**: Show as "Maintenance" status
- **Missing required fields**: Treat as error; show Alert component

### Promotion Validation

- **Expired promotions**: Exclude from carousel
- **Missing discount percentage**: Show generic message
- **Invalid category**: Log warning; display as "Special Offer"

### Network Errors

- **API timeout (> 500ms)**: Show error Alert; offer retry button
- **4xx errors**: Show user-friendly error message
- **5xx errors**: Show generic error message; offer support contact link
- **No internet**: Show Alert with offline state

---

## Type Definitions (TypeScript)

```typescript
// Promotion
type PromoCategory = "discount" | "points_bonus" | "new_member";
interface Promotion {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  loyaltyPointsRequired: number;
  loyaltyPointsValue: number;
  expiryDate: string;
  category: PromoCategory;
  terms: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// TimeSlot
type SlotStatus = "available" | "booked" | "maintenance";
interface TimeSlot {
  id: string;
  date: string;
  time: string;
  displayTime: string;
  duration: number;
  status: SlotStatus;
  capacity: number;
  currentBookings: number;
  dayOfWeek: string;
  dayDisplayDate: string;
}

// Navigation
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  visibleFor: "all" | "guest" | "logged_in";
  icon?: React.ReactNode;
  requiresAuth: boolean;
}

// Footer
interface FooterLink {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

// Hero Banner
interface HeroBanner {
  heading: string;
  subheading?: string;
  backgroundImage?: string;
  ctaLabel: string;
  ctaAction: () => void;
  theme: "light" | "dark";
}
```
