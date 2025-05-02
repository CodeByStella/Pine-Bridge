import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Scripts Table
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("stopped"), // running, paused, stopped
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Trading Accounts Table
export const tradingAccounts = pgTable("trading_accounts", {
  id: serial("id").primaryKey(),
  server: text("server").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  accountNumber: text("account_number").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("disconnected"), // connected, disconnected
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Script-Account Mapping Table
export const scriptAccounts = pgTable("script_accounts", {
  id: serial("id").primaryKey(),
  scriptId: integer("script_id").references(() => scripts.id).notNull(),
  accountId: integer("account_id").references(() => tradingAccounts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  scripts: many(scripts),
  tradingAccounts: many(tradingAccounts)
}));

export const scriptsRelations = relations(scripts, ({ one, many }) => ({
  user: one(users, { fields: [scripts.userId], references: [users.id] }),
  scriptAccounts: many(scriptAccounts)
}));

export const tradingAccountsRelations = relations(tradingAccounts, ({ one, many }) => ({
  user: one(users, { fields: [tradingAccounts.userId], references: [users.id] }),
  scriptAccounts: many(scriptAccounts)
}));

export const scriptAccountsRelations = relations(scriptAccounts, ({ one }) => ({
  script: one(scripts, { fields: [scriptAccounts.scriptId], references: [scripts.id] }),
  account: one(tradingAccounts, { fields: [scriptAccounts.accountId], references: [tradingAccounts.id] })
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Invalid email format"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  country: (schema) => schema.min(2, "Country must be at least 2 characters")
}).omit({ createdAt: true });

export const insertScriptSchema = createInsertSchema(scripts, {
  name: (schema) => schema.min(3, "Script name must be at least 3 characters"),
  code: (schema) => schema.min(10, "Script code must be at least 10 characters")
}).omit({ createdAt: true, lastRun: true });

export const insertTradingAccountSchema = createInsertSchema(tradingAccounts, {
  server: (schema) => schema.min(3, "Server must be at least 3 characters"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  accountNumber: (schema) => schema.min(3, "Account number must be at least 3 characters")
}).omit({ createdAt: true });

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
export type ScriptAccount = typeof scriptAccounts.$inferSelect;
export type Login = z.infer<typeof loginSchema>;
