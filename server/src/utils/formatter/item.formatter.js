export const formatItemResponse = (item) => {
  const isOutOfStock = item.totalStock === 0;

  // 🟢 WEIGH ITEM
  if (item.type === "weighItem") {
    return [
      {
        itemId: item._id,
        type: "weighItem",

        label: isOutOfStock
          ? `${item.displayName} (Out of stock)`
          : `${item.displayName} ₹${item.sellingPrice}/kg`,

        displayName: item.displayName,

        sellingPrice: item.sellingPrice,
        costPerKg: item.costPerKg,

        stock: Number(item.stock.toFixed(2)),
        unit: item.unit,

        outOfStock: isOutOfStock,
      },
    ];
  }

  // 🔵 UNIT ITEM

  // ❌ Out of stock
  if (isOutOfStock) {
    return [
      {
        itemId: item._id,
        type: "unitItem",

        label: `${item.displayName} (Out of stock)`,

        displayName: item.displayName,

        sellingPrice: null,
        costPrice: null,
        quantity: 0,

        unit: item.unit,
        outOfStock: true,
      },
    ];
  }

  // ✅ Normal case
  return item.stockEntries.map((entry) => ({
    itemId: item._id,
    type: "unitItem",

    label: `${item.displayName} ₹${entry.sellingPrice}`,

    displayName: item.displayName,

    sellingPrice: entry.sellingPrice,
    costPrice: entry.costPrice,
    quantity: entry.quantity,

    unit: item.unit,
    outOfStock: false,
  }));
};
