import Item from "../models/item.model.js";

export const getAllItemsTable = async (req, res) => {
  try {
    const items = await Item.find().lean();

    const formatted = items.flatMap((item) => {
      // 🟢 WEIGH ITEM (single row)
      if (item.type === "weighItem") {
        const selling = item.sellingPrice || 0;
        const cost = item.costPerKg || 0;
        const qty = item.stock || 0;

        const profit = selling - cost;
        const margin = cost > 0 ? (profit / cost) * 100 : 0;

        return [
          {
            _id: item._id,
            name: item.displayName,
            type: item.type,
            unit: item.unit,
            sellingPrice: Number(selling.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            quantity: qty,
            profit: Number(profit.toFixed(2)), // 🔥 NEW
            margin: Number(margin.toFixed(2)),
            lowStock: qty <= item.lowStockThreshold,
          },
        ];
      }

      // 🔵 UNIT ITEM (multiple variants)
      if (item.type === "unitItem") {
        return item.stockEntries.map((entry, index) => {
          const selling = entry.sellingPrice || 0;
          const cost = entry.costPrice || 0;
          const qty = entry.quantity || 0;

          const profit = selling - cost;
          const margin = cost > 0 ? (profit / cost) * 100 : 0;

          return {
            _id: `${item._id}-${index}`,
            name: item.displayName,
            type: item.type,
            unit: item.unit,
            sellingPrice: Number(selling.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            quantity: qty,
            profit: Number(profit.toFixed(2)), // 🔥 NEW
            margin: Number(margin.toFixed(2)),
            lowStock: qty <= item.lowStockThreshold,
          };
        });
      }

      return [];
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
