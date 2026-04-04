import express from "express";
import { addWeighItem } from "../controllers/addWeighItem.js";
import { addUnitItem } from "../controllers/addUnitItem.js";
import { getAllItems } from "../controllers/getAllItems.js";
import { calculateEstimate } from "../controllers/calculateEstimate.js";
import { createBill } from "../controllers/createBill.js";
import { getAllItemsTable } from "../controllers/getAllItemsTable.js";
import { getTodayStats } from "../controllers/getTodayStats.js";
import { getLowStockItems } from "../controllers/getLowStockItems.js";

const router = express.Router();

// 📦 Inventory
router.post("/weigh", addWeighItem); // add/update weigh item
router.post("/unit", addUnitItem); // add/update unit item

router.get("/", getAllItems); // get all items

// 💰 Billing
router.post("/estimate", calculateEstimate);
router.post("/sell", createBill);

router.get("/table", getAllItemsTable);
router.get("/analytics/today", getTodayStats);
router.get("/low-stock", getLowStockItems);

export default router;
