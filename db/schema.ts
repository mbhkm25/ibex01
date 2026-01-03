import { pgTable, serial, text, decimal, boolean, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["super_admin", "merchant", "cashier", "customer"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "blocked"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "purchase", "credit_payment"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  storeId: integer("store_id"), // Nullable, mostly for cashiers/staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  logo: text("logo"),
  description: text("description"),
  whatsappNumber: text("whatsapp_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storeMemberships = pgTable("store_memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).notNull().default("0"),
  status: membershipStatusEnum("status").notNull().default("active"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  membershipId: integer("membership_id").references(() => storeMemberships.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  processedBy: integer("processed_by").references(() => users.id), // Nullable for system or self-service if any
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
