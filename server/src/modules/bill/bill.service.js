import Item from "../../models/item.model.js";
import Bill from "../../models/bill.model.js";
import { calculatePrice } from "../../services/calculation.service.js";
import { round } from "../../utils/helper.js";

export const calculateEstimateService = async (data) => {
  return await calculatePrice(data);
};

export const createBillService = async ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be an array");
  }

  let totalPrice = 0;
  let totalProfit = 0;
  const billItems = [];

  for (const entry of items) {
    const item = await Item.findById(entry.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    // =========================
    // 🟢 WEIGH ITEM
    // =========================
    if (item.type === "weighItem") {
      const weight = Number(entry.weight);

      if (!weight || weight <= 0) continue;

      if (weight > item.stock) {
        throw new Error(`${item.displayName} out of stock`);
      }

      // 🔥 SAFE PRICE CALC (NOT FROM FRONTEND)
      const result = await calculatePrice({
        itemId: item._id,
        mode: "price",
        value: weight,
        unit: "kg",
      });

      const price = result.price;

      // 📉 deduct stock
      item.stock -= weight;

      const profitPerKg = item.sellingPrice - item.costPerKg;
      const profit = profitPerKg * weight;

      totalPrice += price;
      totalProfit += profit;

      billItems.push({
        itemId: item._id,
        itemName: item.displayName,
        quantitySold: weight,
        unit: "kg",
        totalPrice: price,
        profit: Number(profit.toFixed(2)),
        sellingPrice: item.sellingPrice,
        costPerKg: item.costPerKg,
      });

      await item.save();
    }

    // =========================
    // 🔵 UNIT ITEM
    // =========================
    else if (item.type === "unitItem") {
      const entryData = item.stockEntries.find(
        (e) => Math.abs(e.sellingPrice - Number(entry.sellingPrice)) < 0.001,
      );

      if (!entryData) {
        throw new Error(`${item.displayName} price not found`);
      }

      if (entryData.quantity < entry.quantity) {
        throw new Error(`${item.displayName} insufficient stock`);
      }

      // 🔥 SAFE PRICE CALC
      const result = await calculatePrice({
        itemId: item._id,
        mode: "price",
        value: entry.quantity,
        sellingPrice: entryData.sellingPrice,
      });

      const price = result.price;

      // 📉 deduct stock
      entryData.quantity -= entry.quantity;

      const profit =
        (entryData.sellingPrice - entryData.costPrice) * entry.quantity;

      totalPrice += price;
      totalProfit += profit;

      billItems.push({
        itemId: item._id,
        itemName: item.displayName,
        quantitySold: entry.quantity,
        unit: "pcs",
        totalPrice: price,
        profit: Number(profit.toFixed(2)),
        sellingPrice: entryData.sellingPrice,
        costPrice: entryData.costPrice,
      });

      await item.save();
    }
  }

  // 🧾 CREATE BILL
  const bill = await Bill.create({
    items: billItems,
    totalPrice,
    totalProfit: Number(totalProfit.toFixed(2)),
  });

  return bill;
};

export const getTodayStatsService = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // 🔥 lean = faster
  const bills = await Bill.find({
    createdAt: { $gte: start, $lte: end },
  }).lean();

  let totalSales = 0;
  let totalProfit = 0;

  const itemMap = {};
  const hourlySales = {};

  for (const bill of bills) {
    totalSales += bill.totalPrice;
    totalProfit += bill.totalProfit;

    // 🥇 Best selling
    for (const item of bill.items) {
      itemMap[item.itemName] =
        (itemMap[item.itemName] || 0) + item.quantitySold;
    }

    // 📊 Hourly
    const hour = new Date(bill.createdAt).getHours();
    hourlySales[hour] = (hourlySales[hour] || 0) + bill.totalPrice;
  }

  // 🥇 best item
  let bestItem = null;
  let maxQty = 0;

  for (const name in itemMap) {
    if (itemMap[name] > maxQty) {
      maxQty = itemMap[name];
      bestItem = name;
    }
  }

  const totalBills = bills.length;
  const avgBill = totalBills ? totalSales / totalBills : 0;

  return {
    totalSales: round(totalSales),
    totalProfit: round(totalProfit),
    totalBills,
    avgBill: round(avgBill),
    bestItem,
    bestItemQty: maxQty,
    hourlySales,
  };
};
