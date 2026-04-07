import { round } from "../helper.js";

export const formatItemTable = (item) => {
  // 🟢 WEIGH ITEM
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
        sellingPrice: round(selling),
        cost: round(cost),
        quantity: qty,
        profit: round(profit),
        margin: round(margin),
        lowStock: qty <= item.lowStockThreshold,
      },
    ];
  }

  // 🔵 UNIT ITEM
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
        sellingPrice: round(selling),
        cost: round(cost),
        quantity: qty,
        profit: round(profit),
        margin: round(margin),
        lowStock: qty <= item.lowStockThreshold,
      };
    });
  }

  return [];
};

// 🔥 shared round helper
