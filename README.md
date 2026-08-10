# EzWash

EzWash is a B2C car wash web app built as a monorepo with a React + Vite frontend and an Elysia-based backend.

## Prerequisites

- Node.js 20+ or Bun 1.0+ installed
- npm or bun available on the command line
- Git for repository checkout

## Workspace Structure

- `frontend/` — React + TypeScript application using Vite
- `backend/` — Elysia backend service
- `package.json` — workspace entrypoint with shared scripts
- `README.md` — this top-level project guide

## Setup

1. Clone the repository:

```bash
git clone <repo-url> ez-wash
cd ez-wash
```

2. Install dependencies:

Using npm:

```bash
npm install
```

Or using bun:

```bash
bun install
```

## Available Commands

From the repository root:

- `npm run build` — build workspace packages if the package supports it
- `npm test` — run tests across workspaces if configured
- `npm run lint` — run linting across workspaces if configured

### Frontend commands

From `frontend/`:

- `npm run dev` — start Vite development server
- `npm run build` — build the frontend for production
- `npm run lint` — run ESLint on frontend source files
- `npm run preview` — preview the production build locally

### Backend commands

From `backend/`:

- `npm run dev` — start the backend service in watch mode

## Notes

- The frontend uses React, TypeScript, and Vite.
- The backend is an Elysia service.
- Keep workspace dependencies aligned and avoid adding heavy packages without justification.

