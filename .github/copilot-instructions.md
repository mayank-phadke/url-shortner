# Copilot Instructions for url-shortner

## Project Overview

- This is a [Next.js](https://nextjs.org) app for URL shortening, analytics, and redirection.
- Uses Prisma ORM with SQLite (see `prisma/schema.prisma`) and stores generated client in `app/generated/prisma`.
- Main API endpoints are in `app/api/shorten/route.ts` (shorten URL), `app/api/redirect/[shortCode]/route.ts` (redirect + analytics), and `app/api/analyrics/route.ts` (analytics reporting).
- All business logic is handled in these API routes; there is no separate backend service.

## Key Patterns & Conventions

- **Prisma Usage:**
  - Import Prisma client from `@/lib/prisma` (which applies Accelerate extension).
  - All DB access is via Prisma models (`shortUrl`, `click`).
- **Short URL Generation:**
  - Uses `nanoid` for random short codes, or a user-supplied alias.
  - Checks for alias collision before creating a new short URL.
- **Analytics:**
  - On redirect, records click info: IP, user agent, referrer, geo (via `ipapi.com`), device/browser/OS (via `lib/utils.ts`).
  - Analytics endpoint aggregates clicks by referrer, device, country, browser, and day.
- **Error Handling:**
  - API routes return JSON error objects with appropriate HTTP status codes.
  - Validation is done with `zod`.
- **Environment Variables:**
  - `DATABASE_URL` for Prisma (see `.env`).
  - `NEXT_PUBLIC_SITE_URL` for constructing public URLs.
- **TypeScript:**
  - Strict mode enabled. Use types for all API route params and responses.
- **Path Aliases:**
  - Use `@/` for root imports (see `tsconfig.json`).

## Developer Workflows

- **Dev server:** `npm run dev` (uses Next.js with Turbopack)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Prisma:**
  - Edit schema in `prisma/schema.prisma`, then run `npx prisma generate` (output is in `app/generated/prisma`).
- **Testing:** No test framework is set up by default.

## Examples

- To add a new API route, place a file in `app/api/{route}/route.ts` and use Next.js API route conventions.
- To add a new DB field, update `prisma/schema.prisma`, regenerate the client, and update usages in API routes.

## Notable Files

- `app/api/shorten/route.ts` — Short URL creation logic
- `app/api/redirect/[shortCode]/route.ts` — Handles redirect and click analytics
- `app/api/analyrics/route.ts` — Analytics aggregation
- `lib/prisma.ts` — Prisma client setup
- `lib/utils.ts` — User agent parsing
- `prisma/schema.prisma` — DB schema

## Project-specific Advice

- Always validate user input with `zod` before DB writes.
- Use the provided utility functions for device/browser detection.
- When adding analytics, follow the pattern in `redirect/[shortCode]/route.ts` for consistent data capture.
- Do not commit `.env` or `app/generated/prisma` (see `.gitignore`).
