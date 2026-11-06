import { response, Router } from "express";

import { authenticate, roles } from "../middleware/auth.js";
import { rateLimit } from "../middleware/errors.js";
import {
  validate,
  id,
  credentials,
  listingRules,
  makeListingRules,
  pageRules,
  body,
} from "../validators/index.js";
import { respond } from "../controllers/http.js";
import { authService } from "../services/auth.js";

import { publicUser } from "../utils/errors.js";
import { User } from "../model/index.js";
export function routes(dependencies) {
  const router = Router();
  const auth = authenticate(dependencies.config);
  const account = authService(dependencies);
  const staff = roles("moderator", "admin");
  const admin = roles("admin");
  const authLimit = rateLimit();
  router.post(
    "/auth/signup",
    authLimit,
    validate([
      ...credentials,
      body("name").isString().trim().isLength({ min: 2, max: 80 }),
    ]),
    respond((req) => account.signup(req.body), 201),
  );
  router.get(
    "/auth/me",
    auth,
    respond((req) => ({
      User: publicUser(req.user),
    })),
  );
  router.post(
    "/auth/verify",
    authLimit,
    validate([
      body("email").isEmail().normalizeEmail(),
      body("code").matches(/^\d{6}$/),
    ]),
    respond((req) => account.verify(req.body)),
  );
  router.post(
    "/auth/resend",
    authLimit,
    validate([body("email").isEmail().normalizeEmail()]),
    respond((req) => account.resend(req.body)),
  );
  router.post(
    "/auth/login",
    authLimit,
    validate(credentials),
    respond((req) => account.login(req.body)),
  );
  router.post(
    "/auth/logout",
    auth,
    respond(() => ({
      message: "Delete the client token. Issued bearer tokens are not revoked.",
    })),
  );

  // Verify login OTP and generate JWT
  router.post(
    "/auth/verify-login-otp",
    authLimit,
    validate([
      body("email").isEmail().normalizeEmail(),
      body("code").matches(/^\d{6}$/),
    ]),
    respond((req) => account.verifyLoginOtp(req.body)),
  );

  // Forgot password
  router.post(
    "/auth/forgot-password",
    authLimit,
    validate([body("email").isEmail().normalizeEmail()]),
    respond((req) => account.forgotPassword(req.body)),
  );

  // Reset password
  router.post(
    "/auth/reset-password",
    authLimit,
    validate([
      body("email").isEmail().normalizeEmail(),
      body("code").matches(/^\d{6}$/),
      body("newPassword").isString().isLength({ min: 8, max: 72 }),
    ]),
    respond((req) => account.resetPassword(req.body)),
  );
  return router;
}
const pickAd = (body) =>
  Object.fromEntries(
    ["title", "description", "price", "city", "category", "condition"]
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  );
