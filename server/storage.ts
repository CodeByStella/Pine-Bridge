import { db } from "@db";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { 
  users, 
  scripts, 
  tradingAccounts, 
  scriptAccounts,
  User,
  InsertUser,
  Script,
  InsertScript,
  TradingAccount,
  InsertTradingAccount,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  // Script methods
  getScripts(userId: number): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  createScript(scriptData: InsertScript): Promise<Script>;
  updateScriptStatus(id: number, status: string): Promise<Script | undefined>;
  deleteScript(id: number): Promise<void>;
  // Trading account methods
  getTradingAccounts(userId: number): Promise<TradingAccount[]>;
  getTradingAccount(id: number): Promise<TradingAccount | undefined>;
  createTradingAccount(accountData: InsertTradingAccount): Promise<TradingAccount>;
  deleteTradingAccount(id: number): Promise<void>;
  // Admin methods
  getUserScripts(userId: number): Promise<Script[]>;
  getUserTradingAccounts(userId: number): Promise<TradingAccount[]>;
  // Session store
  sessionStore: session.Store;
  // Password methods
  hashPassword(password: string): Promise<string>;
  comparePasswords(supplied: string, stored: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getScripts(userId: number): Promise<Script[]> {
    return await db.select().from(scripts).where(eq(scripts.userId, userId));
  }

  async getScript(id: number): Promise<Script | undefined> {
    const result = await db.select().from(scripts).where(eq(scripts.id, id));
    return result[0];
  }

  async createScript(scriptData: InsertScript): Promise<Script> {
    const [script] = await db.insert(scripts).values(scriptData).returning();
    return script;
  }

  async updateScriptStatus(id: number, status: string): Promise<Script | undefined> {
    const now = new Date();
    const [updatedScript] = await db
      .update(scripts)
      .set({ 
        status, 
        lastRun: status === 'running' ? now : undefined 
      })
      .where(eq(scripts.id, id))
      .returning();
    return updatedScript;
  }

  async deleteScript(id: number): Promise<void> {
    await db.delete(scripts).where(eq(scripts.id, id));
  }

  async getTradingAccounts(userId: number): Promise<TradingAccount[]> {
    return await db.select().from(tradingAccounts).where(eq(tradingAccounts.userId, userId));
  }

  async getTradingAccount(id: number): Promise<TradingAccount | undefined> {
    const result = await db.select().from(tradingAccounts).where(eq(tradingAccounts.id, id));
    return result[0];
  }

  async createTradingAccount(accountData: InsertTradingAccount): Promise<TradingAccount> {
    const [account] = await db.insert(tradingAccounts).values(accountData).returning();
    return account;
  }

  async deleteTradingAccount(id: number): Promise<void> {
    await db.delete(tradingAccounts).where(eq(tradingAccounts.id, id));
  }

  async getUserScripts(userId: number): Promise<Script[]> {
    return await db.select().from(scripts).where(eq(scripts.userId, userId));
  }

  async getUserTradingAccounts(userId: number): Promise<TradingAccount[]> {
    return await db.select().from(tradingAccounts).where(eq(tradingAccounts.userId, userId));
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePasswords(supplied: string, stored: string): Promise<boolean> {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
}

// Export an instance of the storage
export const storage = new DatabaseStorage();
