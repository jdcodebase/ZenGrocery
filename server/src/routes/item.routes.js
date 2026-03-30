import express from "express";
import {
  calculateEstimate,
  createBill,
  storeWeighItem,
  getAllItems,
} from "../controllers/item.controller.js";

const router = express.Router();

// 📦 Inventory
router.post("/weigh", storeWeighItem); // add/update weigh item
router.get("/", getAllItems); // get all items

// 💰 Billing
router.post("/estimate", calculateEstimate);
router.post("/sell", createBill);

export default router;
