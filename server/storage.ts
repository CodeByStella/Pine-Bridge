import { User, Script, TradingAccount, InsertUser, InsertScript, InsertTradingAccount } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session from "express-session";
import MongoStore from "connect-mongo";

const scryptAsync = promisify(scrypt);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  // Script methods
  getScripts(userId: string): Promise<Script[]>;
  getScript(id: string): Promise<Script | null>;
  createScript(scriptData: InsertScript): Promise<Script>;
  updateScriptStatus(id: string, status: string): Promise<Script | null>;
  deleteScript(id: string): Promise<void>;
  // Trading account methods
  getTradingAccounts(userId: string): Promise<TradingAccount[]>;
  getTradingAccount(id: string): Promise<TradingAccount | null>;
  createTradingAccount(accountData: InsertTradingAccount): Promise<TradingAccount>;
  deleteTradingAccount(id: string): Promise<void>;
  // Admin methods
  getUserScripts(userId: string): Promise<Script[]>;
  getUserTradingAccounts(userId: string): Promise<TradingAccount[]>;
  // Session store
  sessionStore: session.Store;
  // Password methods
  hashPassword(password: string): Promise<string>;
  comparePasswords(supplied: string, stored: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MongoStore({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/userAuthSystem',
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60 // 1 week
    });
  }

  async getUser(id: string): Promise<User | null> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ email });
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = new User(userData);
    const savedUser = await user.save();
    return { ...savedUser.toObject(), _id: savedUser._id.toString() } as User;
  }
  
  async deleteUser(id: string): Promise<void> {
    // First, delete all user's scripts and trading accounts
    const userScripts = await this.getScripts(id);
    for (const script of userScripts) {
      await this.deleteScript(script._id.toString());
    }
    
    const userAccounts = await this.getTradingAccounts(id);
    for (const account of userAccounts) {
      await this.deleteTradingAccount(account._id.toString());
    }
    
    // Then delete the user
    await User.findByIdAndDelete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }

  async getScripts(userId: string): Promise<Script[]> {
    return await Script.find({ userId });
  }

  async getScript(id: string): Promise<Script | null> {
    return await Script.findById(id);
  }

  async createScript(scriptData: InsertScript): Promise<Script> {
    const script = new Script(scriptData);
    const savedScript = await script.save();
    return { ...savedScript.toObject(), _id: savedScript._id.toString() } as Script;
  }

  async updateScriptStatus(id: string, status: string): Promise<Script | null> {
    const update: any = { status };
    if (status === 'running') {
      update.lastRun = new Date();
    }
    return await Script.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteScript(id: string): Promise<void> {
    await Script.findByIdAndDelete(id);
  }

  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    return await TradingAccount.find({ userId });
  }

  async getTradingAccount(id: string): Promise<TradingAccount | null> {
    return await TradingAccount.findById(id);
  }

  async createTradingAccount(accountData: InsertTradingAccount): Promise<TradingAccount> {
    const account = new TradingAccount(accountData);
    const savedAccount = await account.save();
    return { ...savedAccount.toObject(), _id: savedAccount._id.toString() } as TradingAccount;
  }

  async deleteTradingAccount(id: string): Promise<void> {
    await TradingAccount.findByIdAndDelete(id);
  }

  async getUserScripts(userId: string): Promise<Script[]> {
    return await Script.find({ userId });
  }

  async getUserTradingAccounts(userId: string): Promise<TradingAccount[]> {
    return await TradingAccount.find({ userId });
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
