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
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(',').map(url => url.trim())
      : "http://localhost:5173",
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
