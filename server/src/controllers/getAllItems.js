import Item from "../models/item.model.js";

export const getAllItems = async (req, res) => {
  try {
    const { search = "", type } = req.query;

    // 🔍 Build query
    const query = {
      displayName: { $regex: search, $options: "i" },
    };

    if (type) {
      query.type = type;
    }

    const items = await Item.find(query).limit(10);

    // 🔥 Transform response
    const formatted = items.flatMap((item) => {
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

            stock: item.stock.toFixed(2),
            unit: item.unit,

            outOfStock: isOutOfStock,
          },
        ];
      }

      // 🔵 UNIT ITEM

      // ✅ OUT OF STOCK CASE (IMPORTANT FIX)
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

      // ✅ NORMAL CASE
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
    });

    return res.set("Cache-Control", "no-store").status(200).json(formatted);
  } catch (error) {
    console.error("Fetch Items Error:", error);

    return res.status(500).json({
      message: "Error fetching items",
    });
  }
};
