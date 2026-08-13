# Quickstart: Homepage UI Enhancement Validation Guide

**Feature**: Homepage UI Enhancement with shadcn  
**Date**: 2026-08-13  
**Purpose**: Validation scenarios to prove the feature works end-to-end

---

## Prerequisites

- Node.js 18+
- bun or npm installed
- Frontend dev server running on `http://localhost:5173`
- Backend API server running on `http://localhost:3000` (or configured endpoint)
- shadcn/ui components installed in `frontend/src/components/ui/`

---

## Setup

### 1. Install shadcn/ui Components

```bash
cd frontend

# Initialize shadcn in project
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add carousel
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add alert
```

### 2. Verify Components Installed

```bash
ls -la src/components/ui/
# Should show: button.tsx, card.tsx, badge.tsx, carousel.tsx, dialog.tsx, sheet.tsx, skeleton.tsx, alert.tsx
```

### 3. Start Dev Server

```bash
npm run dev
# Frontend should be accessible at http://localhost:5173
```

### 4. Verify Backend API

```bash
curl http://localhost:3000/api/promotions
# Should return JSON array of promotions

curl "http://localhost:3000/api/slots?days=7"
# Should return JSON array of slots
```

---

## Validation Scenarios

### Scenario 1: Homepage Loads with Hero Banner

**Goal**: Verify hero banner displays with value proposition and CTA button

**Steps**:
1. Open browser to `http://localhost:5173`
2. Wait for page to load (< 3 seconds)
3. Observe hero banner section at top of page

**Expected Outcomes**:
- [ ] Hero banner is visible with background image or gradient
- [ ] Heading "Smart Automated Wash - Book Ahead, Skip the Line!" is displayed prominently
- [ ] "Book a Wash" CTA button is visible and clickable
- [ ] Text is readable (good contrast ratio ≥ 4.5:1)
- [ ] On mobile (< 375px), text and button stack vertically
- [ ] On desktop (> 1024px), button positioned to the right of text

**Test Command**:
```bash
# Check browser console for errors
# Verify no 404s or failed requests
```

---

### Scenario 2: Promotions Carousel Displays & Navigates

**Goal**: Verify promotions carousel renders with all promotions and carousel navigation works

**Steps**:
1. On homepage, scroll to "Hot Promotions" section
2. Observe the carousel with promotion cards
3. Click the right arrow (next) button
4. Observe carousel transition to next set of promotions
5. Click the left arrow (previous) button
6. Observe carousel returns to previous promotions

**Expected Outcomes**:
- [ ] At least 3 promotion cards visible on desktop
- [ ] Each card displays: name (e.g., "20% OFF GOLD"), discount percentage, points value, "View Promo" button
- [ ] Cards are styled with shadcn Card component (white background, border, shadow)
- [ ] Discount percentage is highlighted in a shadcn Badge (green or accent color)
- [ ] Navigation arrows are visible and functional
- [ ] Carousel smoothly transitions between pages (no jank; 60 FPS)
- [ ] On mobile, carousel shows 1 card; tablet shows 2 cards; desktop shows 3 cards
- [ ] Clicking "View Promo" button opens promotion details modal (Dialog component)

**Test Command**:
```bash
# Open DevTools Performance tab
# Record carousel navigation
# Verify FPS ≥ 55 (60 FPS minus 5% tolerance)
```

**API Verification**:
```bash
curl http://localhost:3000/api/promotions | jq '.data | length'
# Should return count ≥ 3
```

---

### Scenario 3: 7-Day Slot Calendar Displays

**Goal**: Verify time slot calendar displays correctly organized by date

**Steps**:
1. On homepage, scroll to "Available Washing Slots" section
2. Observe the slot calendar with day columns (Mon, Tue, Wed, Thu, etc.)
3. For each day, observe the time slots displayed as cards
4. Note visual distinction between available slots (green badge) and booked slots (red badge)
5. Hover over an available slot
6. Observe the "Book" button appears or highlights

**Expected Outcomes**:
- [ ] Calendar displays 7 days (Monday through Sunday, or starting from current day)
- [ ] Each day has a header with day name and date (e.g., "Mon (19/10)")
- [ ] Time slots are organized in vertical columns (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Each slot displays time in HH:MM AM/PM format (e.g., "08:00 AM")
- [ ] Available slots have: green "Available" badge, blue "Book" button (clickable)
- [ ] Booked slots have: red "Booked" badge, disabled "Book" button (grayed out)
- [ ] Slots are rendered using shadcn Card + Badge components
- [ ] Touching/hovering a slot provides visual feedback (background highlight)
- [ ] On mobile, slot cards are readable without horizontal scrolling

**Test Command**:
```bash
# Open DevTools, verify slot grid structure
# Inspect element: slot card should have 'card' + 'badge' classes from shadcn
```

**API Verification**:
```bash
curl "http://localhost:3000/api/slots?days=7" | jq '.data | length'
# Should return ≥ 30 slots (7 days × 4+ slots/day)

curl "http://localhost:3000/api/slots?days=7" | jq '.data | map(select(.status=="available")) | length'
# Should return > 0 (at least some available slots)
```

---

### Scenario 4: Navigation Header Works on Desktop & Mobile

**Goal**: Verify header navigation is functional and responsive

**Steps**:

**Desktop (> 1024px)**:
1. Observe header displays horizontally: "Home | Bookings (Guest) | Promo | Sign In | Sign Up"
2. Click "Home" link → page scrolls to top
3. Click "Promo" link → navigate to promo page (or highlight current section)
4. Click "Sign In" button → Sign In modal opens (Dialog component)
5. Click "Sign Up" button → Sign Up modal opens

**Mobile (< 375px)**:
1. Resize browser to mobile width
2. Header should display hamburger menu icon (☰)
3. Navigation links should NOT display horizontally (hidden by breakpoint)
4. Click hamburger menu → Sheet drawer opens from left side
5. Observe navigation links stacked vertically in drawer
6. Click a navigation link → drawer closes and navigation occurs

**Expected Outcomes**:
- [ ] Desktop header is sticky (remains visible while scrolling)
- [ ] Active navigation link is visually highlighted (underline, color change, etc.)
- [ ] Mobile hamburger menu uses shadcn Sheet component
- [ ] Navigation links have proper ARIA labels for accessibility
- [ ] Touch targets on mobile are ≥ 44x44px
- [ ] No horizontal scrolling on mobile

**Test Command**:
```bash
# Chrome DevTools: Toggle device toolbar (mobile view)
# Resize viewport and verify layout changes at 768px and 1024px breakpoints
```

---

### Scenario 5: Skeleton Loaders Display While Loading

**Goal**: Verify skeleton loaders prevent layout shift and improve perceived performance

**Steps**:
1. Open DevTools Network tab
2. Set network speed to "Slow 4G" or "Throttle"
3. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
4. Observe skeleton placeholders appear before content

**Expected Outcomes**:
- [ ] Hero banner shows skeleton placeholder (matching banner height)
- [ ] Promotion cards show skeleton placeholders (matching card dimensions)
- [ ] Slot cards show skeleton placeholders (matching slot grid dimensions)
- [ ] No layout shift (Cumulative Layout Shift score = 0)
- [ ] Skeletons animate smoothly (gray pulsing background)
- [ ] Real content replaces skeletons when API responses arrive

**Test Command**:
```bash
# DevTools → Lighthouse → Run audit
# Check "Cumulative Layout Shift" metric
# Should be < 0.1 (excellent; typical is 0.1-0.25)
```

---

### Scenario 6: Responsive Design on All Breakpoints

**Goal**: Verify layout adapts correctly to mobile/tablet/desktop

**Steps**:

**Mobile (375px - 480px)**:
1. Resize to 375px width
2. Scroll through entire homepage
3. All text should be readable without zoom
4. No content should overflow horizontally
5. Touch targets should be ≥ 44px

**Tablet (768px - 1024px)**:
1. Resize to 768px width
2. Verify slot grid shows 2 columns
3. Verify carousel shows 2 promotions per view
4. Header should adapt gracefully (may show abbreviated nav)

**Desktop (1280px+)**:
1. Resize to 1280px width
2. Verify slot grid shows 4 columns
3. Verify carousel shows 3 promotions per view
4. Full navigation header displays horizontally

**Expected Outcomes**:
- [ ] All layouts are readable without horizontal scrolling
- [ ] Font sizes are appropriate for each breakpoint (not too small on mobile)
- [ ] Images scale proportionally (no distortion)
- [ ] Button/link sizes meet 44x44px minimum on mobile
- [ ] No layout shift when resizing viewport

**Test Command**:
```bash
# Chrome DevTools → Responsive Device Mode
# Test on: iPhone 12 (390px), iPad (768px), Desktop (1280px)
# Verify layout changes at: 640px (sm), 768px (md), 1024px (lg)
```

---

### Scenario 7: Booking Flow Triggered from Multiple CTA Points

**Goal**: Verify all call-to-action buttons trigger booking flow correctly

**Steps**:
1. Click hero banner "Book a Wash" button
2. Observe Sign In/Sign Up modal opens (Dialog component)
3. Close modal (click X or background)
4. Click on an available time slot → Modal should open again
5. Click "View Promo" on a promotion card → Promotion details modal opens (or navigate to promo page)

**Expected Outcomes**:
- [ ] Hero banner CTA opens auth modal
- [ ] Slot card CTA opens auth modal
- [ ] Promotion card CTA shows full promotion details (Dialog)
- [ ] Modals are styled consistently (shadcn Dialog component)
- [ ] Modal has X button to close and backdrop click to dismiss
- [ ] Tabindex is managed correctly (focus trap inside modal)

**Test Command**:
```bash
# DevTools → Accessibility → View full page accessibility tree
# Verify modal has role="dialog" and aria-label
```

---

### Scenario 8: Error Handling & Graceful Degradation

**Goal**: Verify error states display appropriately when API fails

**Steps**:
1. Stop backend API server
2. Hard refresh homepage (Ctrl+Shift+R)
3. Observe error alerts appear for promotions/slots sections

**Expected Outcomes**:
- [ ] Error Alert component displays when API fails
- [ ] Error message is user-friendly (not technical stack trace)
- [ ] Error message offers retry option or support contact
- [ ] Page remains usable (hero banner, nav, footer still visible)
- [ ] No console errors logged (errors handled gracefully)

**API Failure Response**:
```bash
# Simulate 500 error
curl -X GET http://localhost:3000/api/promotions -H "Accept: application/json" -i
# Should return JSON with "status": "error" and user-friendly message
```

---

### Scenario 9: Lighthouse Accessibility Audit

**Goal**: Verify accessibility score meets requirements (≥ 90)

**Steps**:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Click "Analyze page load"
5. Review results

**Expected Outcomes**:
- [ ] Accessibility score ≥ 90
- [ ] No critical issues reported
- [ ] All interactive elements have keyboard focus indicators
- [ ] Images have alt text (if applicable)
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] ARIA labels present on complex components (carousel, modal)

**Test Command**:
```bash
# Axe browser extension (free accessibility checker)
npx axe-core --help  # Or use Chrome extension
```

---

### Scenario 10: Performance Metrics

**Goal**: Verify page meets performance success criteria

**Steps**:
1. Open Chrome DevTools → Network tab
2. Hard refresh page
3. Wait for all content to load
4. Note metrics in DevTools Performance tab or Lighthouse

**Expected Outcomes**:
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Total page load < 3s (on 4G)
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] No "red" warnings in DevTools performance trace
- [ ] API responses < 500ms each

**Test Command**:
```bash
# Chrome DevTools → Performance
# Record page load and export trace
# Check: FCP, LCP, CLS metrics
```

---

## Test Data Setup

### Mock API Responses

If backend is not available, mock responses in `frontend/src/services/api.ts`:

```typescript
// Promotions mock
const mockPromotions = [
  {
    id: "promo-001",
    name: "20% OFF GOLD",
    discountPercentage: 20,
    loyaltyPointsRequired: 500,
    loyaltyPointsValue: 100,
    expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    // ... other fields
  },
  // ... more promotions
];

// Slots mock
const mockSlots = Array.from({ length: 56 }, (_, i) => ({
  id: `slot-${i}`,
  date: new Date(Date.now() + Math.floor(i / 8) * 24*60*60*1000).toISOString().split('T')[0],
  time: `${8 + (i % 8)}:00`,
  status: i % 3 === 0 ? "booked" : "available",
  // ... other fields
}));

export async function fetchPromotions() {
  return { status: 'success', data: mockPromotions };
}

export async function fetchSlots(days: number) {
  return { status: 'success', data: mockSlots.slice(0, days * 8) };
}
```

---

## Success Criteria Summary

| Criterion | Check | Status |
|-----------|-------|--------|
| Hero banner displays | Scenario 1 | ☐ |
| Carousel navigates | Scenario 2 | ☐ |
| Slots display correctly | Scenario 3 | ☐ |
| Header navigation works | Scenario 4 | ☐ |
| Skeleton loaders show | Scenario 5 | ☐ |
| Responsive layout | Scenario 6 | ☐ |
| CTAs trigger booking flow | Scenario 7 | ☐ |
| Error handling works | Scenario 8 | ☐ |
| Accessibility ≥ 90 | Scenario 9 | ☐ |
| Performance < 3s | Scenario 10 | ☐ |

**All scenarios must pass before feature is considered complete.**

---

## Troubleshooting

### Issue: Components not found in `ui/` folder

**Solution**:
```bash
# Reinstall shadcn components
npx shadcn-ui@latest add button --overwrite
# Repeat for all components
```

### Issue: Tailwind CSS classes not applying

**Solution**:
```bash
# Rebuild Tailwind
npm run build

# Check tailwind.config.ts includes src directory
# content: ['./src/**/*.{ts,tsx}']
```

### Issue: API requests failing

**Solution**:
```bash
# Check backend is running on expected port
curl http://localhost:3000/api/promotions

# Check CORS headers
curl -v http://localhost:3000/api/promotions | grep "Access-Control"

# Add CORS if needed in backend
```

---

## Next Steps

After validation scenarios pass:
1. Run test suite: `npm test`
2. Build for production: `npm run build`
3. Deploy frontend to staging
4. Run E2E tests against staging
5. Deploy to production
