import express from "express";
import itemRoutes from "../modules/item/item.routes.js";
import billRoutes from "../modules/bill/bill.routes.js";

const router = express.Router();

router.use("/items", itemRoutes);
router.use("/bills", billRoutes);

export default router;
