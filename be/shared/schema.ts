import mongoose from "mongoose";
import { z } from "zod";

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const scriptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["running", "paused", "stopped"],
    default: "stopped",
  },
  lastRun: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const tradingAccountSchema = new mongoose.Schema({
  server: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  accountNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["connected", "disconnected"],
    default: "disconnected",
  },
  createdAt: { type: Date, default: Date.now },
});

const scriptAccountSchema = new mongoose.Schema({
  scriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Script",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TradingAccount",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Create models
export const User = mongoose.model("User", userSchema);
export const Script = mongoose.model("Script", scriptSchema);
export const TradingAccount = mongoose.model(
  "TradingAccount",
  tradingAccountSchema
);
export const ScriptAccount = mongoose.model(
  "ScriptAccount",
  scriptAccountSchema
);

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  role: z.string().default("user"), // Added role property
});

export const insertScriptSchema = z.object({
  name: z.string().min(3, "Script name must be at least 3 characters"),
  code: z.string().min(10, "Script code must be at least 10 characters"),
  userId: z.string().default(""),
});

export const insertTradingAccountSchema = z.object({
  server: z.string().min(3, "Server must be at least 3 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accountNumber: z
    .string()
    .min(3, "Account number must be at least 3 characters"),
  userId: z.string().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// TypeScript types
export type User = mongoose.InferSchemaType<typeof userSchema> & {
  _id: string;
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Script = mongoose.InferSchemaType<typeof scriptSchema> & {
  _id: string;
};
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type TradingAccount = mongoose.InferSchemaType<
  typeof tradingAccountSchema
> & { _id: string };
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
export type ScriptAccount = mongoose.InferSchemaType<
  typeof scriptAccountSchema
> & { _id: string };
export type Login = z.infer<typeof loginSchema>;
