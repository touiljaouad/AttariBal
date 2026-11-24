-- Seed the two physical Attari Bal stores so the admin product form can
-- offer per-store stock quantities. The upsert is safe to re-run and preserves
-- existing store IDs (and therefore existing inventory foreign keys).

INSERT INTO "stores" (
  "key",
  "name",
  "short_name",
  "address",
  "plus_code",
  "phone",
  "maps_url",
  "hours",
  "sort_order"
)
VALUES
  (
    'attari-bal-1',
    'Attari Bal 1',
    'ATTARI BAL 1',
    'MJQF+68Q, Mohammédia, Morocco',
    'MJQF+68Q',
    NULL,
    'https://www.google.com/maps/search/?api=1&query=MJQF%2B68Q%2C%20Mohamm%C3%A9dia%2C%20Morocco',
    '{"lundi":"12:00–22:00","mardi":"12:00–22:00","mercredi":"12:00–22:00","jeudi":"12:00–22:00","vendredi":"15:00–22:00","samedi":"12:00–22:00","dimanche":"12:00–22:00"}'::jsonb,
    1
  ),
  (
    'attari-bal-2',
    'Attari Bal 2 (Derb Chabab)',
    'ATTARI BAL 2',
    'Next to Collège Abderrahman Chennaf, Boulevard Al Houria, Derb Chabab, Mohammédia, Morocco',
    NULL,
    NULL,
    'https://www.google.com/maps/search/?api=1&query=Coll%C3%A8ge%20Abderrahman%20Chennaf%2C%20Boulevard%20Al%20Houria%2C%20Derb%20Chabab%2C%20Mohamm%C3%A9dia%2C%20Morocco',
    '{"lundi":"00:00–23:00","mardi":"00:00–23:00","mercredi":"00:00–23:00","jeudi":"00:00–23:00","vendredi":"03:30–23:00","samedi":"00:00–23:00","dimanche":"00:00–23:30"}'::jsonb,
    2
  )
ON CONFLICT ("key") DO UPDATE SET
  "name" = EXCLUDED."name",
  "short_name" = EXCLUDED."short_name",
  "address" = EXCLUDED."address",
  "plus_code" = EXCLUDED."plus_code",
  "maps_url" = EXCLUDED."maps_url",
  "hours" = EXCLUDED."hours",
  "sort_order" = EXCLUDED."sort_order";
