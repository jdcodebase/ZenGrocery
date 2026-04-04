import Item from "../models/item.model.js";

export const addWeighItem = async (req, res) => {
  try {
    let { itemName, buyingPrice, quantity, sellingPrice, lowStockThreshold } =
      req.body;

    // 🔒 Basic validation
    if (!itemName || !buyingPrice || !quantity || !sellingPrice) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 🔢 Convert to numbers
    buyingPrice = Number(buyingPrice);
    quantity = Number(quantity);
    sellingPrice = Number(sellingPrice);

    // ❌ Validate numbers
    if (isNaN(buyingPrice) || isNaN(quantity) || isNaN(sellingPrice)) {
      return res.status(400).json({
        message: "Invalid numeric values",
      });
    }

    if (buyingPrice <= 0 || quantity <= 0 || sellingPrice <= 0) {
      return res.status(400).json({
        message: "Values must be greater than 0",
      });
    }

    // 🧮 Calculate cost per kg (keep precision)
    const newCostPerKg = buyingPrice / quantity;

    if (sellingPrice < newCostPerKg) {
      return res.status(400).json({
        message: "Selling price cannot be less than cost price",
      });
    }

    // 🧠 Normalize name
    const normalizedName = itemName.trim().toLowerCase().replace(/\s+/g, " ");

    const formatName = (name) =>
      name
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    // 🔍 Check existing item
    let item = await Item.findOne({
      itemName: normalizedName,
      type: "weighItem",
    });

    // 📦 Calculate total stock (for threshold validation)
    const totalStock = item ? (item.stock || 0) + quantity : quantity;

    // 🚨 Threshold validation (ONLY if provided)
    if (lowStockThreshold !== undefined) {
      lowStockThreshold = Number(lowStockThreshold);

      if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
        return res.status(400).json({
          message: "Invalid threshold value",
        });
      }

      if (lowStockThreshold > totalStock) {
        return res.status(400).json({
          message: "Threshold must be smaller than total stock",
        });
      }
    }

    // 🆕 CREATE NEW ITEM
    if (!item) {
      item = await Item.create({
        itemName: normalizedName,
        displayName: formatName(itemName),
        type: "weighItem",
        unit: "kg",

        stock: Number(quantity.toFixed(2)),

        costPerKg: Number(newCostPerKg.toFixed(2)),
        sellingPrice,

        lowStockThreshold: lowStockThreshold ?? 0,
      });

      return res.status(201).json({
        message: "Item created successfully",
        item,
      });
    }

    // 🔄 UPDATE EXISTING ITEM (Weighted Average)

    const oldStock = item.stock;
    const oldCost = item.costPerKg;

    let updatedCostPerKg;

    if (oldStock === 0) {
      updatedCostPerKg = newCostPerKg;
    } else {
      updatedCostPerKg =
        (oldStock * oldCost + quantity * newCostPerKg) / (oldStock + quantity);
    }

    // 🧾 Update fields
    item.stock = Number((oldStock + quantity).toFixed(2));
    item.costPerKg = Number(updatedCostPerKg.toFixed(2));

    // ✅ Update selling price only if explicitly sent
    if (sellingPrice !== undefined) {
      item.sellingPrice = sellingPrice;
    }

    // ✅ Update threshold only if explicitly sent
    if (lowStockThreshold !== undefined) {
      item.lowStockThreshold = lowStockThreshold;
    }

    await item.save();

    return res.status(200).json({
      message: "Stock updated successfully",
      item,
    });
  } catch (error) {
    console.error("Store Item Error:", error);
    return res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};
