import express from "express";
import {
  calculateEstimate,
  createBill,
  getTodayStats,
} from "./bill.controller.js";

const router = express.Router();

// 💰 Billing
router.post("/estimate", calculateEstimate);
router.post("/sell", createBill);

// 📊 Analytics
router.get("/analytics/today", getTodayStats);

export default router;
