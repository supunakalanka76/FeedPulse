import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    role: string;
    email: string;
  };
}

// Middleware to protect admin routes
export const protectAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
        data: null,
        error: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET as string;

    const decoded = jwt.verify(token, jwtSecret) as {
      role: string;
      email: string;
    };

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        data: null,
        error: "Forbidden",
      });
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null,
      error: error.message,
    });
  }
};