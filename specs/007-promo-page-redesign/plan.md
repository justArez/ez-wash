# Implementation Plan: Promo Page Redesign

**Branch**: `007-promo-page-redesign` | **Date**: 2026-08-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-promo-page-redesign/spec.md`

## Summary

Redesign the customer Promo Page (`/promo`) to match the wireframe specification with:
1. A **Global Active Promotions** banner carousel showcasing ongoing system-wide campaigns.
2. A **Your Promos (Claimed)** section listing the user's active claimed vouchers with validity dates and a "USE NOW" booking launcher.
3. An **Acclaimable Promos** catalog organized by loyalty tiers (`Silver Tier & Above`, `Gold Tier & Above`, `Platinum Tier`) featuring dynamic point-price buttons that animate to "Claim" on hover, with clear disabled states (`LACKS TIER`, `INSUFFICIENT PTS`).
4. Real-time point balance updates and instant state reflection upon claiming without page reload.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: Vite, Radix UI (@radix-ui/react-slot, tabs, dialog, etc.), Lucide React icons, Tailwind CSS 4, SCSS

**Storage**: Local storage (`ezwash-dashboard`, `ezwash-claimed-promos`), existing `LoyaltyStore` / backend models

**Testing**: TypeScript typecheck (`npm run build`), ESLint (`npm run lint`), component verification

**Target Platform**: Modern desktop and mobile browsers (responsive 320px to 1440px+)

**Project Type**: Web application frontend (React SPA) with full-stack TypeScript models

**Performance Goals**: Claim button hover transition under 150ms; point deduction and voucher addition instant (<100ms client state update); layout shift-free responsive grid rendering

**Constraints**: Match wireframe visual hierarchy; WCAG AA contrast for disabled buttons; zero page reloads; no external heavy animation libraries

**Scale/Scope**: One customer page (`promo.page.tsx`), subcomponents for promo cards and claimed vouchers, model extensions in `loyalty.model.ts` / `promo.model.ts`, and connection to booking modal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Customer Privacy & Data Minimization**: Passed. Only uses existing customer phone, tier, and points balance; no new PII is stored.
- **II. Reliability & Observability**: Passed. Claim operations validate balance and tier bounds client-side and update local persistence with rollback protection.
- **III. Test-First Development**: Passed. Unit checks and TypeScript build validation verify calculation helpers (`checkPromoEligibility`) and state transitions before release. (Playwright tests omitted per AI-Assisted Test Generation Budget).
- **IV. Simplicity & Minimal Scope**: Passed. Utilizes existing shadcn `Card`, `Badge`, and `Button` components without introducing extraneous frameworks.
- **V. Security & Compliance**: Passed. Claim restrictions enforce tier boundaries and non-negative point balances.

## Project Structure

### Documentation (this feature)

```text
specs/007-promo-page-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── promo-page-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository layout)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── promo-card/
│   │   │   ├── claimable-promo-card.component.tsx
│   │   │   └── claimed-promo-card.component.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       └── card.tsx
│   ├── models/
│   │   ├── loyalty.model.ts
│   │   └── promo.model.ts
│   ├── pages/
│   │   └── promo/
│   │       ├── promo.page.tsx
│   │       └── promo.page.scss
│   ├── services/
│   │   ├── loyalty.mock-data.ts
│   │   └── loyalty.service.ts
│   └── App.tsx
```

**Structure Decision**: Place page composition under `frontend/src/pages/promo/` and reusable card subcomponents under `frontend/src/components/` or co-located in `promo/components/`. Mirror shared models in `frontend/src/models/`.

## Complexity Tracking

No constitution violations or additional architectural complexity are introduced by this feature.

