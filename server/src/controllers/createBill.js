import Item from "../models/item.model.js";
import Bill from "../models/bill.model.js";

export const createBill = async (req, res) => {
  try {
    let { items } = req.body;

    // 🛡️ safety (handles nested case also)
    if (!Array.isArray(items) && Array.isArray(items?.items)) {
      items = items.items;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    let totalPrice = 0;
    let totalProfit = 0;
    const billItems = [];

    // 🔁 LOOP ITEMS
    for (const entry of items) {
      const item = await Item.findById(entry.itemId);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // =========================
      // 🟢 WEIGH ITEM
      // =========================
      if (item.type === "weighItem") {
        const weight = Number(entry.weight); // kg

        if (!weight || weight <= 0) continue;

        if (weight > item.stock) {
          return res.status(400).json({
            message: `${item.displayName} out of stock`,
          });
        }

        // 📉 deduct stock
        item.stock -= weight;

        const profitPerKg = item.sellingPrice - item.costPerKg;
        const profit = profitPerKg * weight;

        totalPrice += entry.price;
        totalProfit += profit;

        billItems.push({
          itemId: item._id,
          itemName: item.displayName,
          quantitySold: weight,
          unit: "kg",
          totalPrice: entry.price,
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
        const stockEntry = item.stockEntries.find(
          (e) => Math.abs(e.sellingPrice - entry.sellingPrice) < 0.001,
        );

        if (!stockEntry) {
          return res.status(400).json({
            message: `${item.displayName} price not found`,
          });
        }

        if (stockEntry.quantity < entry.quantity) {
          return res.status(400).json({
            message: `${item.displayName} insufficient stock`,
          });
        }

        // 📉 deduct stock
        stockEntry.quantity -= entry.quantity;

        const profit =
          (stockEntry.sellingPrice - stockEntry.costPrice) * entry.quantity;

        totalPrice += entry.price;
        totalProfit += profit;

        billItems.push({
          itemId: item._id,
          itemName: item.displayName,
          quantitySold: entry.quantity,
          unit: "pcs",
          totalPrice: entry.price,
          profit: Number(profit.toFixed(2)),
          sellingPrice: stockEntry.sellingPrice,
          costPrice: stockEntry.costPrice,
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

    return res.status(201).json({
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    console.error("Billing Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
