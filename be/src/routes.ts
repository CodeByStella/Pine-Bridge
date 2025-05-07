import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertScriptSchema, insertTradingAccountSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // User scripts routes
  app.get("/api/scripts", requireAuth, async (req, res, next) => {
    try {
      const scripts = await storage.getScripts(req.user?.id);
      res.json(scripts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/scripts", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertScriptSchema.parse(req.body);
      const script = await storage.createScript({
        ...validatedData,
        userId: req.user?.id,
      });
      res.status(201).json(script);
    } catch (error) {
      console.log(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      next(error);
    }
  });

  app.patch("/api/scripts/:id/:action", requireAuth, async (req, res, next) => {
    try {
      const { id, action } = req.params;

      // // Validate action
      if (!["start", "pause", "stop"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      // Check if script exists and belongs to user
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }

      if (
        script.userId.toString() !== req.user?.id &&
        req.user?.role !== "admin"
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Map action to status
      const statusMap: { [key: string]: string } = {
        start: "running",
        pause: "paused",
        stop: "stopped",
      };

      const updatedScript = await storage.updateScriptStatus(
        id,
        statusMap[action],
      );
      res.json(updatedScript);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/scripts/:id", requireAuth, async (req, res, next) => {
    try {
      const scriptId = req.params.id;

      // Check if script exists and belongs to user
      const script = await storage.getScript(scriptId);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }

      if (
        script.userId.toString() !== req.user?.id &&
        req.user?.role !== "admin"
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteScript(scriptId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // User trading accounts routes
  app.get("/api/trading-accounts", requireAuth, async (req, res, next) => {
    try {
      const accounts = await storage.getTradingAccounts(req.user?.id);
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/trading-accounts", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertTradingAccountSchema.parse(req.body);
      const account = await storage.createTradingAccount({
        ...validatedData,
        userId: req.user?.id,
      });
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  });

  app.delete(
    "/api/trading-accounts/:id",
    requireAuth,
    async (req, res, next) => {
      try {
        const accountId = parseInt(req.params.id);

        // Check if account exists and belongs to user
        const account = await storage.getTradingAccount(accountId.toString());
        if (!account) {
          return res.status(404).json({ message: "Trading account not found" });
        }

        if (account.userId !== req.user?.id && req.user?.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }

        await storage.deleteTradingAccount(accountId.toString());
        res.status(204).end();
      } catch (error) {
        next(error);
      }
    },
  );

  // Admin routes
  app.get("/api/admin/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's scripts and trading accounts
      const scripts = await storage.getUserScripts(userId);
      const tradingAccounts = await storage.getUserTradingAccounts(userId);

      res.json({
        ...(user as any)._doc,
        scripts,
        tradingAccounts,
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow deleting admin users
      if (user.role === "admin") {
        return res.status(403).json({ message: "Cannot delete admin users" });
      }

      // Delete the user
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
