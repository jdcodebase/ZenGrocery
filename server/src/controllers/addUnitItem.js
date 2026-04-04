import Item from "../models/item.model.js";

export const addUnitItem = async (req, res) => {
  try {
    let { itemName, stockEntries, lowStockThreshold } = req.body;

    // 🔒 Required validation
    if (
      !itemName ||
      !stockEntries ||
      stockEntries.costPrice == null ||
      stockEntries.sellingPrice == null ||
      stockEntries.quantity == null
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const costPrice = Number(stockEntries.costPrice);
    const sellingPrice = Number(stockEntries.sellingPrice);
    const quantity = Number(stockEntries.quantity);

    lowStockThreshold = Number(lowStockThreshold ?? 0);

    // ❌ NaN check
    if (isNaN(costPrice) || isNaN(sellingPrice) || isNaN(quantity)) {
      return res.status(400).json({
        message: "Invalid numeric values",
      });
    }

    // ❌ Value check
    if (costPrice <= 0 || sellingPrice <= 0 || quantity <= 0) {
      return res.status(400).json({
        message: "Values must be greater than 0",
      });
    }

    // ❌ Threshold validation
    if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      return res.status(400).json({
        message: "Invalid threshold value",
      });
    }

    // 🧠 Normalize
    const normalizedName = itemName.trim().toLowerCase();

    const formatName = (name) => name.replace(/\b\w/g, (c) => c.toUpperCase());

    let item = await Item.findOne({
      itemName: normalizedName,
      type: "unitItem",
    });

    // 🆕 CREATE
    if (!item) {
      if (lowStockThreshold >= quantity) {
        return res.status(400).json({
          message: "Threshold must be smaller than stock ❌",
        });
      }

      item = await Item.create({
        itemName: normalizedName,
        displayName: formatName(itemName),
        type: "unitItem",
        unit: "piece",
        lowStockThreshold,
        stockEntries: [stockEntries], // ✅ wrap in array
      });

      return res.status(201).json({
        message: "Unit item created successfully ✅",
        item,
      });
    }

    // 🧠 Calculate total stock
    const existingTotalStock = item.stockEntries.reduce(
      (sum, e) => sum + e.quantity,
      0,
    );

    const newTotalStock = existingTotalStock + quantity;

    if (lowStockThreshold >= newTotalStock) {
      return res.status(400).json({
        message: "Threshold must be smaller than total stock ❌",
      });
    }

    // 🔄 UPDATE
    const existingEntry = item.stockEntries.find(
      (entry) => Math.abs(entry.sellingPrice - sellingPrice) < 0.001,
    );

    if (existingEntry) {
      const totalQty = existingEntry.quantity + quantity;

      // 🔥 weighted avg cost
      existingEntry.costPrice =
        (existingEntry.costPrice * existingEntry.quantity +
          costPrice * quantity) /
        totalQty;

      existingEntry.quantity = totalQty;
    } else {
      item.stockEntries.push({
        costPrice,
        sellingPrice,
        quantity,
      });
    }

    // ✅ Update threshold
    if (lowStockThreshold !== undefined) {
      item.lowStockThreshold = lowStockThreshold;
    }

    await item.save();

    return res.status(200).json({
      message: "Stock updated successfully ✅",
      item,
    });
  } catch (error) {
    console.error("Add Unit Item Error:", error);
    return res.status(500).json({
      message: "Server Error ❌",
    });
  }
};
