import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    tokenHash: text("token_hash").notNull(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_hash_unique").on(t.tokenHash)],
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("categories_slug_unique").on(t.slug)],
);

export const brands = pgTable(
  "brands",
  {
    id: serial("id").notNull().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("brands_slug_unique").on(t.slug)],
);

export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    address: text("address").notNull(),
    plusCode: text("plus_code"),
    phone: text("phone"),
    mapsUrl: text("maps_url").notNull(),
    hours: jsonb("hours").$type<Record<string, string>>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("stores_key_unique").on(t.key)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    description: text("description").notNull().default(""),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    gender: text("gender").notNull().default("Unisexe"),
    condition: text("condition").notNull().default("Très bon état"),
    conditionNotes: text("condition_notes").notNull().default(""),
    sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
    sku: text("sku"),
    status: text("status").notNull().default("draft"), // draft | published | sold
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_unique").on(t.slug),
    index("products_status_idx").on(t.status),
    index("products_created_idx").on(t.createdAt),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    isMain: boolean("is_main").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const inventory = pgTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("inventory_product_store_unique").on(t.productId, t.storeId)],
);

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  instagramUrl: text("instagram_url").notNull().default("https://www.instagram.com/atari_bal/"),
  whatsappUrl: text("whatsapp_url").notNull().default("https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"),
  phone: text("phone").notNull().default("+212 6 48 62 76 91"),
  email: text("email").notNull().default(""),
  aboutTitle: text("about_title").notNull().default("Original brands, authentic style."),
  aboutText: text("about_text").notNull().default(""),
  instagramNote: text("instagram_note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityLog = pgTable(
  "activity_log",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => admins.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_created_idx").on(t.createdAt)],
);

export type Product = typeof products.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
