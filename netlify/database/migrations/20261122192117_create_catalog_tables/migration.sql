CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY,
	"admin_id" integer,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY,
	"product_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"brand_id" integer,
	"category_id" integer,
	"description" text DEFAULT '' NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"gender" text DEFAULT 'Unisexe' NOT NULL,
	"condition" text DEFAULT 'Très bon état' NOT NULL,
	"condition_notes" text DEFAULT '' NOT NULL,
	"sizes" jsonb DEFAULT '[]' NOT NULL,
	"sku" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY,
	"token_hash" text NOT NULL,
	"admin_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1,
	"instagram_url" text DEFAULT 'https://www.instagram.com/atari_bal/' NOT NULL,
	"whatsapp_url" text DEFAULT 'https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB' NOT NULL,
	"phone" text DEFAULT '+212 6 48 62 76 91' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"about_title" text DEFAULT 'Original brands, authentic style.' NOT NULL,
	"about_text" text DEFAULT '' NOT NULL,
	"instagram_note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"address" text NOT NULL,
	"plus_code" text,
	"phone" text,
	"maps_url" text NOT NULL,
	"hours" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_created_idx" ON "activity_log" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_unique" ON "brands" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_product_store_unique" ON "inventory" ("product_id","store_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" ("slug");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" ("status");--> statement-breakpoint
CREATE INDEX "products_created_idx" ON "products" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "stores_key_unique" ON "stores" ("key");--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_admin_id_admins_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_store_id_stores_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_id_admins_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE;