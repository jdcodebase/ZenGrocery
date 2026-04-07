import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

/**
 * ==============================
 * ✅ CORE MIDDLEWARES
 * ==============================
 */

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parser
app.use(express.json());

/**
 * ==============================
 * ✅ LOGGER (basic)
 * ==============================
 * (Later we can move this to middleware/logger.js)
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/**
 * ==============================
 * ✅ ROUTES
 * ==============================
 */
app.use("/api/v1", routes);

/**
 * ==============================
 * ✅ HEALTH CHECK
 * ==============================
 */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
  });
});

/**
 * ==============================
 * ❌ 404 HANDLER
 * ==============================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * ==============================
 * ❌ GLOBAL ERROR HANDLER
 * ==============================
 */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
