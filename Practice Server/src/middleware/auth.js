import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../model/index.js";
import { assert } from "../utils/errors.js";
export const authenticate = (config) => async (req, res, next) => {
  const bearer = req.headers.authorization;
  assert(bearer?.startsWith("Bearer "), 401, "Bearer token required");
  let decoded;
  try {
    decoded = jwt.verify(bearer.slice(7), config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "Ahmed-marketplace",
      audience: "marketplace-client",
    });
  } catch {
    assert(false, 401, "Invalid or expired token");
  }
  assert(
    typeof decoded.sub === "string" && mongoose.isValidObjectId(decoded.sub),
    401,
    "Invalid token subject",
  );
  const user = await User.findById(decoded.sub);
  assert(user?.active && user.verified, 401, "Account unavailable");
  assert(
    (decoded.ver ?? 0) === user.tokenVersion,
    401,
    "Token has been revoked",
  );
  req.user = user;
  next();
};
export const roles =
  (...allowed) =>
  (req, res, next) => {
    assert(allowed.includes(req.user.role), 403, "Role not allowed");
    next();
  };
