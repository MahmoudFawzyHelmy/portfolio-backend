import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  // Prefer Authorization header (Bearer) then fallback to cookie
  const authHeader = req.get("authorization");
  let token = undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  try {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ErrorHandler("User not found", 401));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});
