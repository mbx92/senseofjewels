# Sense of Jewels CMS – Copilot Instructions

## Project Overview
Landing page CMS for **Sense of Jewels** — a Balinese handcrafted jewelry brand. Built with **Nuxt 3** (compatibility version 4), **Prisma 7**, **DaisyUI 5**, **Tailwind CSS v4**, and **PostgreSQL**.

## Tech Stack
- **Framework**: Nuxt 3.21+ with `future.compatibilityVersion: 4` — app files live in `app/` directory
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.ts`). Theme configured via `@plugin "daisyui/theme"` in `app/assets/css/main.css`
- **UI Library**: DaisyUI 5 — custom theme named `"jewels"`, `data-theme` set on `<html>` via `useHead()`
- **Database ORM**: Prisma 7 with `prisma-client` generator (not `prisma-client-js`). Output: `app/generated/prisma`
- **DB Adapter**: `@prisma/adapter-pg` — required for Prisma 7, initialized in `server/utils/prisma.ts`
- **Icons**: `@tabler/icons-vue` — always import individually e.g. `import { IconDiamond } from '@tabler/icons-vue'`
- **Auth**: Cookie-based session (`mm_session` stores user ID), `bcryptjs` for password hashing

## Key Conventions

### File Structure (Nuxt 4 compat)
- Pages: `app/pages/`
- Layouts: `app/layouts/`
- Components: `app/components/`
- Composables: `app/composables/`
- Middleware: `app/middleware/`
- Types: `app/types/index.ts`
- Assets/CSS: `app/assets/css/main.css`
- Server API: `server/api/`
- Server utils: `server/utils/`

### Alias Resolution
- `~` and `@` resolve to `app/` (not root) due to Nuxt 4 compat mode
- Server files must use **relative imports**: `../../utils/prisma`, `../../app/generated/prisma/client`

### Prisma 7 Rules
- No `url` field in `datasource db` block in schema.prisma — URL comes from `prisma.config.ts`
- Always use `prisma-client` generator (not `prisma-client-js`)
- After schema changes: run `npx prisma migrate dev --name <name>` then `npx prisma generate`
- Seed script: `npm run db:seed` (uses `tsx`) — default admin: `admin@senseofjewels.com` / `admin123`

### Nuxt / Nitro Rules
- Use `useRuntimeConfig()` in server routes — never `process.env` directly
- Runtime config keys use camelCase; env vars use `NUXT_` prefix
- Use `import.meta.dev` instead of `process.env.NODE_ENV === 'development'`
- `createError()` uses `statusMessage` not `message`

### UI / Styling Rules
- **Theme**: `"jewels"` — luxury jewelry aesthetic
- **Colors**: primary = charcoal black `oklch(18% 0.01 260)`, secondary = champagne gold `oklch(72% 0.11 75)`, base = warm ivory `oklch(98.5% 0.005 85)`
- **Page layout pattern**: header with title + subtitle + action button, bordered card (`border border-base-300`), table or grid content, empty state with icon
- **Forms in modals**: always use `<fieldset class="fieldset">` with `<legend class="fieldset-legend text-xs font-semibold uppercase tracking-wide">`
- **Buttons**: `btn-sm` in modals and headers, `btn-primary` for main actions, `btn-ghost` for cancel
- **Badges**: use `badge-soft` variant (e.g. `badge-soft badge-success`)
- **Modal close**: `<button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">` with `IconX`
- **Modal backdrop**: always include `<form method="dialog" class="modal-backdrop" @click="showModal = false"><button>close</button></form>`

### TypeScript
- All interfaces defined in `app/types/index.ts`
- Import with `import type { ... } from '~/types'`
- Always type `useFetch<T>()` generically

### Auth
- Global middleware at `app/middleware/auth.global.ts` — protects all routes except `/login`
- Session cookie `mm_session` is `httpOnly`, stores user ID (cuid)
- `useAuth()` composable: `user` (useState), `isLoggedIn`, `fetchUser()`, `logout()`
- Call `auth.fetchUser()` in `onMounted()` in default layout

## Database Models
- `User` — id, name, email (unique), password (bcrypt hashed)
- `SiteSetting` — key/value store for global settings (siteName, contactEmail, etc.)
- `Section` — landing page sections (hero, about, collections, sustainability, contact)
- `Collection` — jewelry collections (Necklaces, Earrings, Bracelets, Rings, Custom)
- `Product` — individual jewelry pieces, belongs to Collection, supports gallery array
- `Testimonial` — customer reviews with name, role, content, avatar, rating
- `Media` — uploaded images stored in `public/uploads/media/`

## CMS Pages
- `/` — Dashboard (overview stats: sections, collections, products, testimonials)
- `/sections` — Edit landing page section content (slug, title, subtitle, body, image)
- `/collections` — Manage jewelry collections
- `/products` — Manage jewelry products with filtering by collection
- `/testimonials` — Manage customer testimonials with star rating
- `/media` — Upload and manage images
- `/settings` — Global site settings (siteName, contactEmail, address, social links)

## API Routes
- `GET/POST /api/sections`, `GET/PUT/DELETE /api/sections/[id]`
- `GET/POST /api/collections`, `GET/PUT/DELETE /api/collections/[id]`
- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`
- `GET/POST /api/testimonials`, `PUT/DELETE /api/testimonials/[id]`
- `GET /api/media`, `POST /api/media/upload`, `PUT/DELETE /api/media/[id]`
- `GET/PUT /api/settings`

## Environment Variables (.env)
```
DATABASE_URL="postgresql://user:pass@host:5432/cms?schema=public"
```
