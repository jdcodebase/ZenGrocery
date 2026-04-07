import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST be first

import app from "./app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

// 🔒 env validation
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

// 🔥 Graceful shutdown (IMPROVED)
const shutdown = async () => {
  console.log("🛑 Shutting down server...");

  try {
    if (server) {
      server.close(() => {
        console.log("HTTP server closed");
      });
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// 🔥 handle unhandled errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  shutdown();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  shutdown();
});

startServer();
