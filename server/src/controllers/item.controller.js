import Item from "../models/item.model.js";
import Bill from "../models/bill.model.js";

export const storeWeighItem = async (req, res) => {
  try {
    let { itemName, buyingPrice, quantity, sellingPrice } = req.body;

    // 🔒 Validation
    if (!itemName || !buyingPrice || !quantity || !sellingPrice) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    buyingPrice = Number(buyingPrice);
    quantity = Number(quantity);
    sellingPrice = Number(sellingPrice);

    if (buyingPrice <= 0 || quantity <= 0 || sellingPrice <= 0) {
      return res.status(400).json({
        message: "Values must be greater than 0",
      });
    }

    // 🧠 Normalize name
    const normalizedName = itemName.trim().toLowerCase();

    const formatName = (name) => name.replace(/\b\w/g, (c) => c.toUpperCase());

    // 🧠 Calculate new cost
    const newCostPerKg = buyingPrice / quantity;

    // 🔍 Check existing item
    let item = await Item.findOne({ itemName: normalizedName });

    // 🆕 CREATE NEW ITEM
    if (!item) {
      item = await Item.create({
        itemName: normalizedName,
        displayName: formatName(itemName),
        type: "weighItem",

        buyingPrice,
        initialQuantity: quantity,
        stock: quantity,

        costPerKg: Number(newCostPerKg.toFixed(2)),
        sellingPrice,

        unit: "kg",
      });

      return res.status(201).json({
        message: "Item created successfully",
        item,
      });
    }

    // 🔄 UPDATE EXISTING ITEM (Weighted Avg Logic)

    const oldStock = item.stock;
    const oldCost = item.costPerKg;

    let updatedCostPerKg;

    if (oldStock === 0) {
      // edge case
      updatedCostPerKg = newCostPerKg;
    } else {
      updatedCostPerKg =
        (oldStock * oldCost + quantity * newCostPerKg) / (oldStock + quantity);
    }

    // 🧾 Update fields
    item.stock = oldStock + quantity;
    item.buyingPrice += buyingPrice; // total invested
    item.costPerKg = Number(updatedCostPerKg.toFixed(2));

    // (optional) update selling price if provided
    if (sellingPrice) {
      item.sellingPrice = sellingPrice;
    }

    await item.save();

    return res.status(200).json({
      message: "Stock updated successfully",
      item,
    });
  } catch (error) {
    console.error("Store Item Error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().select(
      "_id itemName displayName sellingPrice unit stock",
    );

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching items" });
  }
};

export const calculateEstimate = async (req, res) => {
  try {
    const { itemId, mode, value, unit } = req.body;

    // 🔒 validations
    if (!itemId || !mode || !value) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const sellingPrice = item.sellingPrice; // ₹ per kg

    // 🔥 CASE 1: Calculate Price (kg/g → ₹)
    if (mode === "price") {
      let weightInKg;

      if (unit === "g") {
        weightInKg = value / 1000;
      } else {
        weightInKg = value; // assume kg
      }

      const totalPrice = weightInKg * sellingPrice;

      return res.status(200).json({
        price: Math.ceil(totalPrice),
      });
    }

    // 🔥 CASE 2: Calculate Weight (₹ → g)
    if (mode === "weight") {
      const weightInKg = value / sellingPrice;

      const grams = weightInKg * 1000;

      return res.status(200).json({
        weight: Math.round(grams),
      });
    }

    return res.status(400).json({ message: "Invalid mode" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Calculation failed" });
  }
};

export const createBill = async (req, res) => {
  try {
    const { items } = req.body;

    // 🔒 validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let totalPrice = 0;
    let totalProfit = 0;

    const billItems = [];

    // 🔁 loop through items
    for (const i of items) {
      const { itemId, quantity, price } = i;

      const item = await Item.findById(itemId);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // 🚨 stock check
      if (quantity > item.stock) {
        return res.status(400).json({
          message: `${item.displayName} out of stock`,
        });
      }

      // 💰 profit calculation
      const cost = quantity * item.costPerKg;
      const profit = price - cost;

      // 📦 deduct stock
      item.stock -= quantity;
      await item.save();

      // 📄 prepare bill item
      billItems.push({
        itemId: item._id,
        itemName: item.displayName,
        quantitySold: quantity,
        totalPrice: price,
        profit,
        unit: item.unit,

        // ✅ snapshots
        sellingPrice: item.sellingPrice,
        costPerKg: item.costPerKg,
      });

      totalPrice += price;
      totalProfit += profit;
    }

    // 🧾 create bill
    const bill = await Bill.create({
      items: billItems,
      totalPrice,
      totalProfit,
    });

    return res.status(201).json({
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create bill" });
  }
};
