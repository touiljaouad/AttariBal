# Cloudflare + Neon + R2 migration

This migration is being prepared on the `cloudflare-neon-r2-migration` branch. The existing `main` branch and Netlify deployment are intentionally left unchanged.

## Target architecture

- Cloudflare Workers + OpenNext: Next.js storefront and admin application.
- Neon PostgreSQL: products, categories, brands, stores, inventory, admin accounts, sessions and settings.
- Cloudflare R2: product image objects.
- Cloudflare Hyperdrive: pooled connection from Workers to Neon.

Cloudflare currently documents Hyperdrive as the recommended Neon connection path for Workers. It supports standard Postgres drivers and Drizzle's Postgres adapters, including interactive transactions.

## Important: do not cut over before backing up

The current application uses Netlify Database and Netlify Blobs. The repository does not contain the live database contents or uploaded image objects. Those must be exported from the existing Netlify project before the new deployment can replace it.

Keep the current Netlify site online until the new Cloudflare deployment has passed the full verification checklist.

## Account setup required

1. Create or sign in to a Cloudflare account.
2. Create an R2 bucket named `attaribal-product-images`.
3. Create a Neon project in a region close to the Cloudflare/Neon supported region you choose.
4. In Cloudflare, create a Hyperdrive configuration pointing at the Neon Postgres connection string. Use a dedicated Neon role with only the permissions the application needs.
5. Copy the Hyperdrive configuration ID into `wrangler.jsonc` at `hyperdrive[0].id`.
6. Add the Neon direct connection string as a local secret for schema migration only; do not commit it.

Never paste passwords, database URLs, Cloudflare API tokens, or service credentials into GitHub files or chat messages.

## Cloudflare Next.js adapter setup

This project is an existing Next.js 16 App Router application. Use the OpenNext Cloudflare adapter documented for existing Next.js apps:

```bash
npm install @opennextjs/cloudflare
npm install --save-dev wrangler
npx @opennextjs/cloudflare migrate
```

The migrate command may adjust the Wrangler/OpenNext files and package scripts. Review its changes before committing. The production build command in Cloudflare Workers Builds should be `npx @opennextjs/cloudflare build`; the deploy command should be `npx @opennextjs/cloudflare deploy`.

## Application code still to migrate

- Replace `drizzle-orm/netlify-db` with a Postgres driver connected through the Hyperdrive binding. Preserve the existing Drizzle schema and SQL behavior.
- Ensure database clients are created with the request's Cloudflare context and closed correctly for Workers. Preserve the product create/update transactions.
- Replace `@netlify/blobs` image storage with the `PRODUCT_IMAGES` R2 binding. Keep the current upload validation, MIME checks, UUID object names, public image URLs and deletion behavior.
- Replace Netlify-specific imports and remove Netlify packages only after all references are gone.
- Replace the file-based setup-token fallback with the required `ADMIN_SETUP_TOKEN` secret. Workers do not provide persistent local filesystem storage.
- Review Node.js APIs used by password hashing and rate limiting against the Workers runtime; do not weaken password hashing or CSRF protections.
- Configure the runtime and build-time variables in Cloudflare Workers Builds and Worker settings.

## Data migration

Before switching DNS or production traffic:

1. Export the live Netlify PostgreSQL database using the supported Netlify database export/connection workflow.
2. Import the dump into Neon and verify row counts for admins, sessions, products, images, inventory, stores, categories, brands, and settings.
3. Export every object from the Netlify Blobs `product-images` store.
4. Upload those objects to the R2 bucket using the same filenames.
5. Keep the existing `/api/uploads/<filename>` URLs working, or update the product image URLs in Neon in one controlled migration.
6. Verify every product image, including the main image, before cutover.

Do not run a schema push against an empty production Neon database until the data-import plan is ready. Do not overwrite or delete the Netlify database or Blobs store during this migration.

## Required secrets and variables

Worker secrets (never commit values):

- `ADMIN_SETUP_TOKEN` — only needed until the first admin is created; set it securely before first use.
- `NEXTAUTH_SECRET` is not used by this project; do not add it.
- `DATABASE_URL` — only if required by the selected runtime/driver; prefer the Hyperdrive binding for runtime database access.

Build/runtime variables:

- `NEXT_PUBLIC_SITE_URL` — the Cloudflare production URL or custom domain.
- `NODE_ENV=production` is supplied by the platform.

For local Drizzle migrations, use a local `.env` file containing the Neon direct connection string. Keep it out of source control.

## Verification before production cutover

- `/api/health` returns `{"ok":true}`.
- Public homepage, catalogue, filters, product pages and store pages work.
- Admin login and logout work; existing admin credentials remain valid.
- Existing products, category/brand records, per-store quantities and settings match the source database.
- Create, edit, duplicate, publish, unpublish, mark-sold and delete product operations work.
- Upload, display, replace and delete product images work; images persist after a new deployment.
- Test the admin product form with Attari Bal 1 and Attari Bal 2 and verify per-store quantities.
- Verify CSRF origin checks, login/setup rate limiting and session expiry.
- Check Cloudflare Worker logs and Neon usage after realistic testing.

Only after all checks pass should the custom domain be moved to Cloudflare. Keep Netlify available as a rollback target until the new site has been stable.
