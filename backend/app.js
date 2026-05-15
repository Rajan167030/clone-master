import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import contentRouter from "./routes/content.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import profileRouter from "./routes/profile.routes.js";
import aiRouter from "./routes/ai.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'https://foundersconnect.vercel.app',
        'https://www.foundersconnect.co.in',
        'https://foundersconnect.co.in',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:3000'
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For development, allow all localhost origins
      if (origin.includes('localhost')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// Debug middleware to catch empty bodies
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] ${req.method} ${req.url} - Content-Type: ${req.get("content-type")}`);
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] body keys:`, Object.keys(req.body || {}));
  }
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Founders Connect backend is running.",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongo: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);
app.use("/api/profile", profileRouter);
app.use("/api/ai", aiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
