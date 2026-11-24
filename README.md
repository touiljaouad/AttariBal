# Ataribal100original

Premium digital storefront and inventory platform for a physical thrift / branded clothing store in Mohammédia, Morocco. Customers browse real inventory online, then buy **in person** at Attari Bal 1 or Attari Bal 2. There is deliberately **no checkout, payment, order, delivery or shipping functionality**.

## Stack

- Next.js 16 (App Router, TypeScript, React 19), Tailwind CSS 4
- PostgreSQL + Drizzle ORM
- Server-side persistent image storage with signed-in upload validation (Netlify Blobs by default, or `UPLOAD_DIR` on a VPS)
- Database-backed sessions, scrypt password hashing, httpOnly cookies, CSRF origin checks, rate limiting
- French interface with Arabic RTL switcher
- SEO metadata, per-product Open Graph, sitemap.xml, robots.txt

## Features

### Public
- Homepage with real products from PostgreSQL, category/brand browsing, two-store section, editorial content, Instagram/WhatsApp links.
- Catalog with search, category, brand, gender, size, condition, price, store, availability filters and sorting/pagination.
- Product pages with photo gallery, exact per-store quantities, directions, WhatsApp contact and social share.
- About, Contact, Find Our Stores, FAQ, Privacy, Terms and Store Information pages.
- No fake products, testimonials or reviews. Empty states are shown until the owner publishes real items.

### Admin (`/admin`)
- First-admin creation at `/setup` requires the server-side `ADMIN_SETUP_TOKEN` (no hardcoded credentials, no public registration).
- Dashboard: totals, published/draft/sold/available/low-stock counts, per-store availability, category breakdown, recent activity.
- Products: multi-photo drag-and-drop upload (JPG/PNG/WebP, 8 MB limit, previews, main photo, reorder, replace, remove), full product data, condition notes, sizes, per-store stock, drafts, preview, publish, duplicate, delete, bulk actions.
- Separate inventory rows per store; zero stock automatically means unavailable at that location.
- Category and brand management, editable contact/social/about settings.

## Local installation

1. `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, plus a random `ADMIN_SETUP_TOKEN` (`openssl rand -hex 24`).
3. Start PostgreSQL and create the `app_db` database.
4. `npx drizzle-kit push` (applies `src/db/schema.ts`).
5. `npm run dev` and open `http://localhost:3000/setup`.
6. Enter the setup token, an admin email and a password (10+ characters). You will be signed in automatically.

**Where the setup token comes from:** `ADMIN_SETUP_TOKEN` in the environment is used when present. If it is missing (for example a host that regenerates `.env` on each restart), the app generates a token once and stores it in `data/setup-token` (mode 600, never served over HTTP). Read it on the server with `cat data/setup-token`. The login page shows a direct link to `/setup` while no administrator exists.

The setup page stops accepting requests once an administrator exists. To reset a lost password, run the secure CLI helper (it prompts for the new password without echoing it):

```bash
npx tsx scripts/reset-admin-password.ts admin@yourdomain.ma
```

## Production build

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain so sitemap/robots/Open Graph URLs are correct. Use `npm run build` output as the deploy artifact.

## Deployment (not yet performed)

This repository is **not deployed** to a public 24/7 host: no hosting account, deploy token, Docker or git remote was available in the build environment. Two ready-to-run paths are provided — see `docs/DEPLOYMENT.md` for exact commands.

- **Option A — VPS with Docker:** `docker compose up -d --build`, then `docker compose exec app npx drizzle-kit push`. PostgreSQL and the app run together; photos persist on the `./data` volume.
- **Option B — Vercel + Supabase:** set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_STORAGE_BUCKET`; the storage adapter switches automatically and photos are written to Supabase Storage instead of the ephemeral disk.

Backups: `./scripts/backup.sh` dumps PostgreSQL and tars the upload directory, pruning files older than `RETENTION_DAYS`.

### Deploying by hand (any Node host)

1. Host Next.js on a VPS with Node 20+ (or any Node host with HTTPS). Set all environment variables in the host's dashboard — never commit `.env`.
2. Provision PostgreSQL (Supabase, Neon, or a managed instance), set `DATABASE_URL`, and run `npx drizzle-kit push` once against that URL.
3. Choose image storage. `src/lib/storage.ts` selects the backend automatically: Netlify Blobs by default (required on Netlify, whose server filesystem is read-only), local disk when `UPLOAD_DIR` is set (VPS/Docker), or Supabase when its credentials are present. Force one with `IMAGE_STORAGE=netlify|local|supabase`. Only URLs from these backends are accepted when saving a product, so arbitrary external image URLs cannot be injected.
4. Point the custom domain at the host, enable HTTPS, and set `NEXT_PUBLIC_SITE_URL` (also used by the CSRF host check).
5. Open `https://YOUR_DOMAIN/setup` once to create the administrator, then confirm `/setup` reports setup as closed.
6. Verify `/api/health`, the homepage, the catalogue, a product page and admin login.

Required accounts/credentials: hosting account, PostgreSQL URL, domain DNS access, and (for serverless) Supabase Storage credentials. No third-party keys are needed locally.

## Backup

```bash
./scripts/backup.sh                                   # db dump + uploads tarball into ./backups
BACKUP_DIR=/mnt/nas RETENTION_DAYS=60 ./scripts/backup.sh

# Restore
pg_restore --clean --if-exists -d "$DATABASE_URL" backups/db-YYYYMMDD-HHMMSS.dump
tar xzf backups/uploads-YYYYMMDD-HHMMSS.tar.gz -C data/
```

Automate both with cron or the host's backup tool and store copies off-site.

## Security notes

- Admin routes and APIs call `getSessionAdmin()` on the server; public visitors cannot read drafts or mutate data.
- Passwords are hashed with per-user random salt and scrypt; sessions are stored as SHA-256 token hashes with 30-day expiry.
- Login/setup are rate limited; mutating APIs require a matching browser Origin.
- Uploads are restricted by MIME type, magic bytes and size, and served with `nosniff` and immutable caching.
- For multi-instance production, replace the in-process login/upload rate limiter with Redis/shared storage.

## Instagram

A real Instagram feed requires Meta Graph API permissions and a long-lived access token. Those permissions are not configured, so the site shows a clearly labelled, functional link to the official account instead of a fake feed.

## Brand asset

The official logo file was not present in the project workspace. `public/logo.svg` and `src/components/BrandLogo.tsx` provide an original black-and-gold wordmark consistent with the brand. Replace them with the provided official artwork without changing the surrounding layout.
