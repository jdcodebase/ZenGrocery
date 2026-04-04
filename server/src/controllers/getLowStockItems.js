import Item from "../models/item.model.js";

export const getLowStockItems = async (req, res) => {
  try {
    const items = await Item.find();

    const lowStock = items
      .map((item) => item.toObject()) // ✅ enables virtuals
      .filter((item) => item.isLowStock);

    const formatted = lowStock.map((item) => ({
      _id: item._id,
      displayName: item.displayName,
      stock: item.totalStock,
      unit: item.unit,
      outOfStock: item.outOfStockVariants.length > 0,
      variants: item.outOfStockVariants, // 🔥 add this
    }));

    console.log(formatted);

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching low stock" });
  }
};
