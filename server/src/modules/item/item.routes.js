import express from "express";
import {
  createOrUpdateWeighItem,
  createOrUpdateUnitItem,
  getAllItems,
  getAllItemsTable,
  getLowStockItems,
} from "./item.controller.js";

const router = express.Router();

// 📦 Inventory
router.post("/weigh", createOrUpdateWeighItem);
router.post("/unit", createOrUpdateUnitItem);

router.get("/", getAllItems);
router.get("/table", getAllItemsTable);
router.get("/low-stock", getLowStockItems);

export default router;
