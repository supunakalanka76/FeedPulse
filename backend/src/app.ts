import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FeedPulse API is running",
    data: null,
    error: null,
  });
});

// Import routes
import feedbackRoutes from "./routes/feedback.routes";
import authRoutes from "./routes/auth.routes";

// Use routes
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);

export default app;