import Item from "../models/item.model.js";

export const calculatePrice = async ({
  itemId,
  mode,
  value,
  unit,
  sellingPrice,
}) => {
  if (!itemId || !mode || value == null) {
    throw new Error("Missing fields");
  }

  const item = await Item.findById(itemId);

  if (!item) {
    throw new Error("Item not found");
  }

  const numericValue = Number(value);

  if (isNaN(numericValue) || numericValue <= 0) {
    throw new Error("Invalid value");
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

      return {
        price: Math.ceil(totalPrice),
      };
    }

    // 👉 ₹ → g
    if (mode === "weight") {
      const weightInKg = numericValue / pricePerKg;

      if (weightInKg > item.stock) {
        throw new Error("Not enough stock");
      }

      const grams = weightInKg * 1000;
      const rounded = Math.round(grams / 5) * 5;

      return {
        weight: rounded,
      };
    }
  }

  // =========================
  // 🔵 UNIT ITEM
  // =========================
  if (item.type === "unitItem") {
    // 🔥 FIX: find price from DB, not trust blindly
    const entry = item.stockEntries.find(
      (e) => Math.abs(e.sellingPrice - Number(sellingPrice)) < 0.001,
    );

    if (!entry) {
      throw new Error("Price variant not found");
    }

    const pricePerPiece = entry.sellingPrice;

    // 👉 qty → ₹
    if (mode === "price") {
      const totalPrice = numericValue * pricePerPiece;

      return {
        price: Math.round(totalPrice),
      };
    }

    // 👉 ₹ → qty
    if (mode === "quantity") {
      const qty = Math.floor(numericValue / pricePerPiece);

      if (qty > entry.quantity) {
        throw new Error("Not enough stock");
      }

      return {
        quantity: qty,
      };
    }
  }

  throw new Error("Invalid mode");
};
