# Deployment — Ataribal100original

**Current status: NOT deployed to a public 24/7 host.**

The build in this workspace is production-ready and verified (build, health check, full admin and storefront flows). It runs in the sandbox preview only. Deploying requires credentials and accounts that do not exist in this environment — no `VERCEL_TOKEN`, no Docker, no git remote, and no hosting account were available. Everything needed to deploy is prepared below; only the credentials are missing.

Two supported paths. Choose one.

---

## Option A — VPS with Docker (simplest, keeps local photo storage)

Best if you have a server (Hetzner, DigitalOcean, OVH, AWS EC2…). Photos stay on a mounted volume.

```bash
# 1. On the server, get the code
git clone <your-repo-url> ataribal && cd ataribal

# 2. Create .env
cp .env.example .env
#    set POSTGRES_PASSWORD, NEXT_PUBLIC_SITE_URL=https://your-domain,
#    and ADMIN_SETUP_TOKEN=$(openssl rand -hex 24)

# 3. Build and start
docker compose up -d --build

# 4. Create the database schema (first run only)
docker compose exec app npx drizzle-kit push

# 5. Read the setup token and create the admin account
cat data/setup-token          # or use the ADMIN_SETUP_TOKEN you set
#    open https://your-domain/setup once, then https://your-domain/admin/login
```

Put the site behind HTTPS with Caddy, Traefik or nginx + Let's Encrypt, and point your domain's DNS A record at the server.

Backups (cron, daily):
```bash
0 3 * * * cd /path/to/ataribal && ./scripts/backup.sh >> /var/log/ataribal-backup.log 2>&1
```
`scripts/backup.sh` dumps PostgreSQL and tars `data/uploads`, pruning files older than `RETENTION_DAYS` (default 30). Copy `backups/` off-site.

---

## Option B — Vercel + Supabase (serverless)

Vercel's filesystem is ephemeral, so photos **must** go to Supabase Storage — the app already supports this; you only supply credentials.

1. **Supabase** → create project → Database → copy the connection string (use the *pooled* connection, port 6543, and set `pgbouncer=true` in the URL query if offered) → put it in `DATABASE_URL`.
2. **Supabase Storage** → create a **public** bucket named `product-photos` → Storage → Settings → API: copy the project URL and the `service_role` key.
   Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET=product-photos`.
   The `service_role` key bypasses row-level security — keep it server-side only (never `NEXT_PUBLIC_*`).
3. **Apply the schema once** from your machine:
   ```bash
   DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" npx drizzle-kit push
   ```
4. **Vercel** → New Project → import the Git repo (framework auto-detected as Next.js) → add all environment variables from `.env.example` → Deploy.
5. Set `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app` (or your custom domain) and redeploy so sitemap/robots/Open Graph URLs are correct.
6. Add the custom domain in Vercel → Settings → Domains, and update the DNS records it shows.
7. Open `https://your-domain/setup` immediately, create the admin account, then confirm `/setup` reports that setup is closed.

Supabase backups: Database → Backups → enable daily backups (Pro plan) or schedule `pg_dump` yourself with `scripts/backup.sh`.

---

## Required accounts and secrets

| Item | Needed for | Where |
| --- | --- | --- |
| Hosting account (VPS or Vercel) | Running the app | Provider dashboard |
| `DATABASE_URL` | All catalogue/inventory data | Host env vars |
| `ADMIN_SETUP_TOKEN` | One-time first-admin creation | Host env vars (or `data/setup-token`) |
| `NEXT_PUBLIC_SITE_URL` | Sitemap, robots, OG tags, CSRF host check | Host env vars |
| Supabase Storage credentials | Photos on serverless hosts | Host env vars |
| Domain + DNS + TLS | HTTPS public access | Registrar / host |

Never commit `.env`; `data/` and `.env` are already git-ignored.

## Post-deployment verification

- `GET /api/health` → `{"ok":true}`
- `/` renders the storefront; `/boutique` lists products
- `/admin/login` → sign in → `/admin` dashboard loads
- Upload a photo in `/admin/products/new` and reload the page: the image must still be there (proves storage persistence)
- `/sitemap.xml` and `/robots.txt` respond, and `robots.txt` disallows `/admin`
- Check the site on a phone: layout, filters, product page, store directions

## Rollback

Keep the previous image/tag (`docker compose` with a pinned tag) or the previous Vercel deployment (Promote → previous). Restore data with:
```bash
pg_restore --clean --if-exists -d "$DATABASE_URL" backups/db-YYYYMMDD-HHMMSS.dump
tar xzf backups/uploads-YYYYMMDD-HHMMSS.tar.gz -C data/
```
