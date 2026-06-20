import { Strategy as LocalStrategy } from "passport-local";
import type { RequestHandler } from "express";
import passport from "passport";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Hash a plaintext password. Format: "<hashHex>.<saltHex>" */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `${derivedKey.toString("hex")}.${salt}`;
}

/** Compare a plaintext password against a stored hash. Timing-safe. */
export async function comparePassword(password: string, stored: string): Promise<boolean> {
  const [hashedHex, salt] = stored.split(".");
  if (!hashedHex || !salt) return false;
  const hashedBuf = Buffer.from(hashedHex, "hex");
  const suppliedBuf = await scryptAsync(password, salt, KEY_LENGTH);
  if (hashedBuf.length !== suppliedBuf.length) return false;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Augment Express's User type with our own shape (never includes passwordHash).
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      isAdmin: boolean;
    }
  }
}

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) return done(null, false, { message: "Invalid email or password" });
          const valid = await comparePassword(password, user.passwordHash);
          if (!valid) return done(null, false, { message: "Invalid email or password" });
          return done(null, { id: user.id, email: user.email, isAdmin: user.isAdmin });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) return done(null, false);
      done(null, { id: user.id, email: user.email, isAdmin: user.isAdmin });
    } catch (err) {
      done(err as Error);
    }
  });
}

/** Require any logged-in user. */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

/** Require a logged-in user with isAdmin = true. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
