import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const plans = pgTable("plan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: integer("productId").notNull(),
  productName: text("productName"),
  variantId: integer("variantId").notNull().unique(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  isUsageBased: boolean("isUsageBased").default(false),
  interval: text("interval"),
  intervalCount: integer("intervalCount"),
  trialInterval: text("trialInterval"),
  trialIntervalCount: integer("trialIntervalCount"),
  sort: integer("sort"),
});

export const webhookEvents = pgTable("webhookEvent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  eventName: text("eventName").notNull(),
  processed: boolean("processed").default(false),
  body: jsonb("body").notNull(),
  processingError: text("processingError"),
});

export const products = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscription", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  product_id: text("product_id")
    .notNull()
    .references(() => products.id),
  customer_id: text("customer_id"),
  status: text("status").notNull(),
  collection_method: text("collection_method"),
  current_period_start: timestamp("current_period_start", { mode: "date" }),
  current_period_end: timestamp("current_period_end", { mode: "date" }),
  canceled_at: timestamp("canceled_at", { mode: "date" }),
  last_transaction_id: text("last_transaction_id"),
  last_transaction_date: timestamp("last_transaction_date", { mode: "date" }),
  next_transaction_date: timestamp("next_transaction_date", { mode: "date" }),
  metadata: jsonb("metadata"),
  mode: text("mode"),
  created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const userUsage = pgTable("user_usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  usage_type: text("usage_type").notNull(), // 'formula_generation', etc.
  usage_count: integer("usage_count").notNull().default(0),
  usage_limit: integer("usage_limit").notNull(),
  reset_date: timestamp("reset_date", { mode: "date" }).notNull(),
  created_at: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const PLAN_TIERS = {
  FREE: "free",
  PRO: "pro",
  MAX: "max",
} as const;

export type PlanTier = (typeof PLAN_TIERS)[keyof typeof PLAN_TIERS];
