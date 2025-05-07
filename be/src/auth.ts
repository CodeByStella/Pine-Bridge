import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { Document } from "mongoose";
import { configDotenv } from "dotenv";

configDotenv();
// Extend the Express User type to include MongoDB document properties
declare global {
  namespace Express {
    interface User extends Document {
      _id: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      country: string;
      role: "user" | "admin";
      createdAt: Date;
      toObject(): any;
    }
  }
}
export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pine-bridge-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (
            !user ||
            !(await storage.comparePasswords(password, user.password))
          ) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user as Express.User);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user: Express.User, done) => done(null, user._id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user as Express.User);
    } catch (error) {
      done(error);
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash the password
      const hashedPassword = await storage.hashPassword(validatedData.password);

      // Create the user
      const user = (await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      })) as Express.User;

      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password back to the client
        const userWithoutPassword = { ...user, password: undefined };
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // User login endpoint
  app.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);

      passport.authenticate(
        "local",
        (
          err: Error | null,
          user: Express.User | false,
          info: { message?: string },
        ) => {
          if (err) return next(err);
          if (!user) {
            return res
              .status(401)
              .json({ message: info?.message || "Invalid credentials" });
          }

          req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);

            // Don't send the password back to the client
            const userWithoutPassword = {
              ...user.toObject(),
              password: undefined,
            };
            res.status(201).json(userWithoutPassword);
          });
        },
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  // User logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Don't send the password back to the client
    const userWithoutPassword = { ...req.user.toObject(), password: undefined };
    res.status(200).json(userWithoutPassword);
  });
}
