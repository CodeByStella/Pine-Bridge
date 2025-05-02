import { db } from "./index";
import * as schema from "@shared/schema";
import { storage } from "../server/storage";

async function seed() {
  try {
    // Check if admin user exists
    const existingAdmin = await storage.getUserByEmail("admin@pinebridge.com");
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await storage.hashPassword("admin123");
      await db.insert(schema.users).values({
        email: "admin@pinebridge.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        country: "US",
        role: "admin",
      });
      console.log("Admin user created");
    }

    // Check if demo user exists
    const existingUser = await storage.getUserByEmail("user@pinebridge.com");
    
    if (!existingUser) {
      // Create demo user
      const hashedPassword = await storage.hashPassword("user123");
      const [user] = await db.insert(schema.users).values({
        email: "user@pinebridge.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        country: "US",
        role: "user",
      }).returning();
      
      // Create sample scripts for the demo user
      await db.insert(schema.scripts).values([
        {
          name: "BTCUSD Strategy",
          code: "// Sample BTCUSD Trading Strategy\nstrategy(\"BTCUSD_SMA_Crossover\", overlay=true)\n\n// Define parameters\nfastLength = input(9, \"Fast Length\")\nslowLength = input(21, \"Slow Length\")\n\n// Calculate moving averages\nfastMA = sma(close, fastLength)\nslowMA = sma(close, slowLength)\n\n// Generate trading signals\ngoLong = crossover(fastMA, slowMA)\ngoShort = crossunder(fastMA, slowMA)\n\n// Execute trading strategy\nif (goLong)\n    strategy.entry(\"Buy\", strategy.long)\n\nif (goShort)\n    strategy.entry(\"Sell\", strategy.short)",
          userId: user.id,
          status: "running",
          lastRun: new Date()
        },
        {
          name: "ETHUSD Momentum",
          code: "// Sample ETHUSD Momentum Strategy\nstrategy(\"ETHUSD_RSI_Strategy\", overlay=true)\n\n// Define parameters\nrsiLength = input(14, \"RSI Length\")\noverbought = input(70, \"Overbought Level\")\noversold = input(30, \"Oversold Level\")\n\n// Calculate RSI\nrsiValue = rsi(close, rsiLength)\n\n// Generate trading signals\ngoLong = crossover(rsiValue, oversold)\ngoShort = crossunder(rsiValue, overbought)\n\n// Execute trading strategy\nif (goLong)\n    strategy.entry(\"Buy\", strategy.long)\n\nif (goShort)\n    strategy.entry(\"Sell\", strategy.short)",
          userId: user.id,
          status: "stopped",
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          name: "XAUUSD RSI",
          code: "// Sample XAUUSD RSI Strategy\nstrategy(\"XAUUSD_RSI_Strategy\", overlay=true)\n\n// Define parameters\nrsiLength = input(14, \"RSI Length\")\noverbought = input(75, \"Overbought Level\")\noversold = input(25, \"Oversold Level\")\n\n// Calculate RSI\nrsiValue = rsi(close, rsiLength)\n\n// Generate trading signals\ngoLong = crossover(rsiValue, oversold)\ngoShort = crossunder(rsiValue, overbought)\n\n// Execute trading strategy\nif (goLong)\n    strategy.entry(\"Buy\", strategy.long)\n\nif (goShort)\n    strategy.entry(\"Sell\", strategy.short)",
          userId: user.id,
          status: "paused",
          lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        }
      ]);
      
      // Create sample trading accounts for the demo user
      await db.insert(schema.tradingAccounts).values([
        {
          server: "MT4 Server1",
          username: "trader001",
          password: "pass123",
          accountNumber: "12345678",
          userId: user.id,
          status: "connected"
        },
        {
          server: "MT5 Server2",
          username: "trader002",
          password: "pass456",
          accountNumber: "87654321",
          userId: user.id,
          status: "disconnected"
        }
      ]);

      console.log("Demo user with sample data created");
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

seed();
