import Item from "../models/item.model.js";

export const calculateEstimate = async (req, res) => {
  try {
    const { itemId, mode, value, unit, sellingPrice } = req.body;

    if (!itemId || !mode || value == null) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const numericValue = Number(value);

    if (isNaN(numericValue) || numericValue <= 0) {
      return res.status(400).json({ message: "Invalid value" });
    }

    // =========================
    // 🟢 WEIGH ITEM
    // =========================
    if (item.type === "weighItem") {
      const pricePerKg = item.sellingPrice;

      // 👉 kg/g → ₹
      if (mode === "price") {
        const weightInKg = unit === "g" ? numericValue / 1000 : numericValue;
        const totalPrice = weightInKg * pricePerKg;

        return res.status(200).json({
          price: Math.ceil(totalPrice),
        });
      }

      // 👉 ₹ → g
      if (mode === "weight") {
        const weightInKg = numericValue / pricePerKg;

        if (weightInKg > item.stock) {
          return res.status(400).json({
            message: "Not enough stock",
          });
        }

        const grams = weightInKg * 1000;
        const rounded = Math.round(grams / 5) * 5;

        return res.status(200).json({
          weight: rounded,
        });
      }
    }

    // =========================
    // 🔵 UNIT ITEM
    // =========================
    if (item.type === "unitItem") {
      if (!sellingPrice) {
        return res.status(400).json({
          message: "sellingPrice required",
        });
      }

      const entry = item.stockEntries.find(
        (e) => Math.abs(e.sellingPrice - sellingPrice) < 0.001,
      );

      if (!entry) {
        return res.status(404).json({
          message: "Price variant not found",
        });
      }

      const pricePerPiece = entry.sellingPrice;

      // 👉 qty → ₹
      if (mode === "price") {
        const totalPrice = numericValue * pricePerPiece;

        return res.status(200).json({
          price: Math.round(totalPrice),
        });
      }

      // 👉 ₹ → qty
      if (mode === "quantity") {
        const qty = Math.floor(numericValue / pricePerPiece);

        if (qty > entry.quantity) {
          return res.status(400).json({
            message: "Not enough stock",
          });
        }

        return res.status(200).json({
          quantity: qty,
        });
      }
    }
    return res.status(400).json({ message: "Invalid mode" });
  } catch (error) {
    console.error("Estimate Error:", error);
    return res.status(500).json({
      message: "Calculation failed ❌",
    });
  }
};
