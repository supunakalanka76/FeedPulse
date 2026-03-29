import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Controller to handle authentication-related requests
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        data: null,
        error: "Missing credentials",
      });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET as string;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null,
        error: "Unauthorized",
      });
    }

    const token = jwt.sign(
      { role: "admin", email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token },
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      data: null,
      error: error.message,
    });
  }
};