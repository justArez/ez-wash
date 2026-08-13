# Research: Homepage UI Enhancement with shadcn

**Feature**: Homepage UI Enhancement with shadcn  
**Date**: 2026-08-13  
**Scope**: Resolve technical decisions and best practices for shadcn integration

## Research Topics

### 1. shadcn/ui Installation & Setup

**Decision**: Install shadcn/ui via CLI into existing Vite + React + Tailwind project

**Rationale**: 
- shadcn/ui is a collection of re-usable React components built on Radix UI and styled with Tailwind CSS
- Compatible with existing project stack (Vite, React 19, TypeScript, Tailwind CSS 4)
- Provides pre-built components (Button, Card, Carousel, Dialog, Sheet, Badge, Skeleton, Alert) that match project needs
- No runtime dependency bloat; components are copied into project, not imported from node_modules
- Supports customization via CSS variables (Tailwind)

**Installation Path**:
- Run `npx shadcn-ui@latest init` in frontend directory
- Configure: TypeScript ✓, CSS variables for theming ✓, component directory `src/components/ui`
- Install specific components via CLI: `npx shadcn-ui@latest add button card carousel dialog sheet badge skeleton alert`

**Alternatives Considered**:
- Material-UI: Too heavy; brings own design system conflicting with Tailwind
- Headless UI: Requires more custom styling; shadcn provides ready-made styled components
- Manual component library: Duplicates existing work; shadcn is battle-tested and accessible

**Reference**: https://ui.shadcn.com/docs (official shadcn documentation)

---

### 2. Carousel Component Implementation

**Decision**: Use shadcn Carousel (built on Embla Carousel) with custom arrow controls and auto-scroll disabled for manual navigation

**Rationale**:
- Embla Carousel provides accessibility (ARIA labels, keyboard navigation) out-of-the-box
- shadcn Carousel wrapper simplifies integration; handles responsive breakpoints
- Manual navigation (prev/next buttons) aligns with wireframe spec ("< >" arrows)
- Avoids auto-scroll which can distract users; improves UX
- Performance: CSS-based transforms ensure 60 FPS animations (no jank)

**Configuration**:
```
- opts.loop: false (prevent infinite loop; stop at edges)
- opts.align: 'start' (align first item to start)
- Responsive: show 1 card mobile, 2 tablets, 3 desktop (via CSS grid + media queries)
- Touch-friendly: enable touch drag; minimize momentum scrolling
```

**Accessibility**:
- ARIA labels on carousel container and nav buttons
- Keyboard: Arrow keys (Left/Right) navigate; Enter/Space selects promotion
- Focus visible on all interactive elements (shadcn built-in)

**Alternatives Considered**:
- React Slick: Requires jQuery; heavier than Embla
- Custom carousel: High maintenance; shadcn provides tested solution
- Infinite scroll: Confusing UX per Nielsen Norman Group; manual navigation preferred

---

### 3. Responsive Design Breakpoints

**Decision**: Mobile-first approach with Tailwind CSS breakpoints: mobile (< 375px), tablet (768px), desktop (1024px+)

**Rationale**:
- Mobile-first design ensures progressive enhancement; desktop experience built on mobile foundation
- Tailwind breakpoints align with industry standards: sm (640px), md (768px), lg (1024px), xl (1280px)
- Time slot display: 1 column mobile, 2 tablet, 4 desktop allows enough slots per day without clutter
- Touch-friendly: 44x44px minimum target size on all breakpoints (shadcn buttons comply)

**Implementation**:
```tsx
{/* mobile: 1 col, tablet: 2 col, desktop: 4 col */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Alternatives Considered**:
- Desktop-first: Harder to optimize for mobile; mobile is 60%+ traffic
- Fixed 12-column grid: Too complex; Tailwind's responsive classes are simpler

---

### 4. Skeleton Loaders for Progressive Loading

**Decision**: Use shadcn Skeleton component for hero banner, slot cards, and promotion cards while data loads

**Rationale**:
- Reduces perceived load time (perceived performance > actual performance)
- Indicates that content is loading; reduces user anxiety
- Skeleton dimensions match actual component dimensions (prevents layout shift; improves Lighthouse CLS score)
- shadcn Skeleton is lightweight (CSS animation only; no JavaScript overhead)

**Implementation**:
```tsx
// Show skeletons while isLoading = true
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array(8).fill(null).map((_, i) => <Skeleton key={i} className="h-24 rounded" />)}
  </div>
) : (
  // Render actual slots
)}
```

**Alternatives Considered**:
- No loading state: Creates blank screen perceived as broken/slow
- Spinner: Doesn't prevent layout shift; Skeleton is better UX

---

### 5. Responsive Navigation (Mobile Menu)

**Decision**: Use shadcn Sheet component for mobile hamburger menu; sticky header with shadcn Navigation components

**Rationale**:
- Sheet is a slide-out drawer (Radix Dialog + animations)
- Keeps mobile viewport clean; standard UX pattern
- Desktop: full horizontal navigation bar (shadcn Nav Menu or custom flexbox)
- Sticky header: navigation always accessible while scrolling (improves UX)

**Implementation**:
```tsx
// Desktop
<nav className="hidden md:flex gap-4">
  {/* Horizontal nav items */}
</nav>

// Mobile
<Sheet>
  <SheetTrigger>☰</SheetTrigger>
  <SheetContent side="left">
    {/* Vertical nav items */}
  </SheetContent>
</Sheet>
```

**Alternatives Considered**:
- Full-width mobile menu: Wastes space; drawer is standard and compact
- Sticky nav only on desktop: Hurts mobile UX; sticky nav should be on all viewports

---

### 6. Promotion Card Styling

**Decision**: Use shadcn Card component with Badge for discount percentage and CTA Button for "View Promo"

**Rationale**:
- Card provides visual boundary and depth (shadow); organizes content hierarchy
- Badge (colored label) highlights discount visually; catches attention
- Button styling is consistent across app (shadcn enforces this)
- Card + Badge + Button composition is Tailwind/shadcn pattern; familiar to team

**Data Structure**:
```
Promotion
├── name: string
├── discountPercent: number (badge display)
├── loyaltyPointsRequired: number
├── expiryDate: ISO string
└── ctaAction: () => void
```

**Alternatives Considered**:
- Inline discount in title: Less visual impact; badge is stronger
- Custom card styling: Shadcn Card + Tailwind is faster; consistent with design system

---

### 7. Time Slot Component with Status Badge

**Decision**: Use shadcn Card for slot container + shadcn Badge for status (available/booked) + shadcn Button for "Book" CTA

**Rationale**:
- Card provides visual grouping; Badge shows status at a glance (green = available, red = booked)
- Consistent with promotion card pattern; unified design language
- Disabled state on "Book" button when status = booked (built into shadcn Button)
- Hover effect on available slots triggers "Book" button visibility (Tailwind `group-hover`)

**Styling States**:
```
Available slot: green badge, blue button, hover brightens background
Booked slot: red badge, disabled button (gray), cursor-not-allowed
```

**Alternatives Considered**:
- Custom SVG icons: More visual but harder to maintain; Badge is simpler
- No status indicator: Confusing which slots are available; Badge is essential

---

### 8. Dialog (Modal) for Sign In/Sign Up

**Decision**: Reuse existing auth modals; integrate shadcn Dialog component for consistent styling

**Rationale**:
- Spec mentions "Sign In/Sign Up modal is triggered"; assumes auth system exists (per assumptions)
- Refactor existing modal components to use shadcn Dialog (Radix Dialog primitive)
- Ensures consistent modal styling across app (hero CTA, slot booking, promotion details)

**Trigger Points**:
1. Hero banner CTA button → Sign In/Sign Up modal
2. Slot "Book" button → Sign In/Sign Up modal (if guest)
3. Promotion "View Promo" button → Promotion details dialog (or navigate to /promo page)

**Alternatives Considered**:
- Full-page navigation: Loses context; modals are better UX for secondary actions
- Toast notifications: Insufficient for complex auth forms; modals needed

---

### 9. Styling System: CSS Variables vs Tailwind Classes

**Decision**: Use Tailwind CSS classes for component styling; shadcn CSS variables for theming (colors, spacing)

**Rationale**:
- Tailwind JIT compiler optimizes bundle size; only used classes included in build
- CSS variables (via shadcn init setup) allow dark mode / theme switching without code changes
- Existing project uses Tailwind; minimal learning curve
- Performance: Compiled CSS classes are faster than runtime CSS-in-JS

**Theme Setup**:
- `globals.css` includes shadcn CSS variable definitions (--primary, --secondary, --accent, --destructive, etc.)
- Components use `className="bg-primary text-primary-foreground"` (semantic Tailwind classes that map to CSS vars)

**Alternatives Considered**:
- Styled Components: Runtime overhead; Tailwind is faster
- Inline styles: Poor maintainability; Tailwind classes are better
- CSS Modules: Overkill for component library; Tailwind is simpler

---

### 10. Testing Strategy for shadcn Components

**Decision**: Use Vitest (lightweight, Vite-native) with React Testing Library for unit/integration tests

**Rationale**:
- Vitest: Vite-native test runner; fast, no webpack overhead
- React Testing Library: Tests component behavior from user perspective (not implementation details)
- Lightweight: No Jest/Babel overhead; aligns with project's performance goals

**Test Scope**:
- Component rendering: Carousel loads, slots display, promotions visible
- User interactions: Click "Book", navigate carousel, open modals
- Responsive: Layout changes correctly at mobile/tablet/desktop breakpoints
- Accessibility: ARIA labels present, keyboard navigation works

**Setup**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
# Create vitest.config.ts alongside vite.config.ts
# Create src/tests/ directory with .test.tsx files
```

**Alternatives Considered**:
- Playwright: Overkill for component testing; better for E2E
- Jest: Slower than Vitest; not Vite-native
- No testing: Violates constitution principle (Test-First Development)

---

### 11. API Integration Points

**Decision**: Fetch slots and promotions from existing backend APIs; implement error states + retry logic

**Rationale**:
- Spec assumes existing APIs: `/api/slots` and `/api/promotions`
- 500ms max latency acceptable per constraints; implement timeout
- Error handling: Display shadcn Alert component if API fails
- Retry: 1-second exponential backoff for transient errors (network timeouts)

**Component-Level**:
```tsx
const [slots, setSlots] = useState<Slot[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  fetchSlots()
    .then(setSlots)
    .catch(setError)
    .finally(() => setIsLoading(false));
}, []);
```

**Error UI**:
```tsx
{error && (
  <Alert variant="destructive">
    <AlertTitle>Error loading slots</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

**Alternatives Considered**:
- No error handling: Poor UX; users see blank screen
- Infinite retries: Can hang; exponential backoff with max attempts is better
- Server-side rendering: Out of scope; client-side fetching is current pattern

---

## Resolution Summary

| Topic | Decision | Confidence |
|-------|----------|------------|
| shadcn Installation | CLI install + copy components to `src/components/ui` | ✅ High |
| Carousel | shadcn Carousel (Embla) with manual nav, no auto-scroll | ✅ High |
| Responsive Breakpoints | Tailwind sm/md/lg; mobile-first 1/2/4 columns | ✅ High |
| Skeleton Loaders | Use shadcn Skeleton for hero/slots/promotions | ✅ High |
| Mobile Navigation | shadcn Sheet drawer + sticky header | ✅ High |
| Card Styling | shadcn Card + Badge + Button composition | ✅ High |
| Dialog (Modal) | shadcn Dialog for Sign In/Sign Up/Details | ✅ High |
| Theming | Tailwind classes + shadcn CSS variables | ✅ High |
| Testing | Vitest + React Testing Library | ✅ High |
| API Integration | Fetch from `/api/slots` and `/api/promotions` with error handling | ✅ High |

---

## Dependencies to Install

```bash
# Core (already present)
react@19.2.8, react-dom@19.2.8, tailwindcss@4.3.3, typescript@6.0.2

# shadcn/ui components (via CLI)
npx shadcn-ui@latest add button card carousel dialog sheet badge skeleton alert

# Testing (for Phase 2 - tasks)
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Optional: animation library for smooth transitions
npm install class-variance-authority clsx tailwind-merge
```

---

## Next Steps (Phase 1)

1. Run shadcn CLI initialization and component installation
2. Generate `data-model.md` with entity definitions
3. Generate `contracts/api-endpoints.md` with API request/response schemas
4. Generate `quickstart.md` with validation scenarios
