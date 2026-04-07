import Item from "../../models/item.model.js";
import { formatItemResponse } from "../../utils/formatter/item.formatter.js";
import { formatItemTable } from "../../utils/formatter/itemTable.formatter.js";

export const createOrUpdateWeighItemService = async (data) => {
  let { itemName, buyingPrice, quantity, sellingPrice, lowStockThreshold } =
    data;

  // 🔒 validation
  if (!itemName || !buyingPrice || !quantity || !sellingPrice) {
    throw new Error("All required fields must be provided");
  }

  buyingPrice = Number(buyingPrice);
  quantity = Number(quantity);
  sellingPrice = Number(sellingPrice);

  if (isNaN(buyingPrice) || isNaN(quantity) || isNaN(sellingPrice)) {
    throw new Error("Invalid numeric values");
  }

  if (buyingPrice <= 0 || quantity <= 0 || sellingPrice <= 0) {
    throw new Error("Values must be greater than 0");
  }

  const newCostPerKg = buyingPrice / quantity;

  if (sellingPrice < newCostPerKg) {
    throw new Error("Selling price cannot be less than cost price");
  }

  const normalizedName = itemName.trim().toLowerCase().replace(/\s+/g, " ");

  const formatName = (name) =>
    name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  let item = await Item.findOne({
    itemName: normalizedName,
    type: "weighItem",
  });

  const totalStock = item ? (item.stock || 0) + quantity : quantity;

  if (lowStockThreshold !== undefined) {
    lowStockThreshold = Number(lowStockThreshold);

    if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      throw new Error("Invalid threshold value");
    }

    if (lowStockThreshold > totalStock) {
      throw new Error("Threshold must be smaller than total stock");
    }
  }

  // 🆕 CREATE
  if (!item) {
    return await Item.create({
      itemName: normalizedName,
      displayName: formatName(itemName),
      type: "weighItem",
      unit: "kg",
      stock: Number(quantity.toFixed(2)),
      costPerKg: Number(newCostPerKg.toFixed(2)),
      sellingPrice,
      lowStockThreshold: lowStockThreshold ?? 0,
    });
  }

  // 🔄 UPDATE (weighted avg)
  const oldStock = item.stock;
  const oldCost = item.costPerKg;

  const updatedCostPerKg =
    oldStock === 0
      ? newCostPerKg
      : (oldStock * oldCost + quantity * newCostPerKg) / (oldStock + quantity);

  item.stock = Number((oldStock + quantity).toFixed(2));
  item.costPerKg = Number(updatedCostPerKg.toFixed(2));

  if (sellingPrice !== undefined) {
    item.sellingPrice = sellingPrice;
  }

  if (lowStockThreshold !== undefined) {
    item.lowStockThreshold = lowStockThreshold;
  }

  await item.save();

  return item;
};

export const createOrUpdateUnitItemService = async (data) => {
  let { itemName, stockEntries, lowStockThreshold } = data;

  // 🔒 Required validation
  if (
    !itemName ||
    !stockEntries ||
    stockEntries.costPrice == null ||
    stockEntries.sellingPrice == null ||
    stockEntries.quantity == null
  ) {
    throw new Error("All required fields must be provided");
  }

  const costPrice = Number(stockEntries.costPrice);
  const sellingPrice = Number(stockEntries.sellingPrice);
  const quantity = Number(stockEntries.quantity);

  // ❗ FIX: don't default immediately
  const hasThreshold = lowStockThreshold !== undefined;

  if (hasThreshold) {
    lowStockThreshold = Number(lowStockThreshold);
  }

  // ❌ NaN check
  if (isNaN(costPrice) || isNaN(sellingPrice) || isNaN(quantity)) {
    throw new Error("Invalid numeric values");
  }

  // ❌ Value check
  if (costPrice <= 0 || sellingPrice <= 0 || quantity <= 0) {
    throw new Error("Values must be greater than 0");
  }

  // ❌ Threshold validation
  if (hasThreshold && (isNaN(lowStockThreshold) || lowStockThreshold < 0)) {
    throw new Error("Invalid threshold value");
  }

  // 🧠 Normalize
  const normalizedName = itemName.trim().toLowerCase().replace(/\s+/g, " ");

  const formatName = (name) =>
    name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  let item = await Item.findOne({
    itemName: normalizedName,
    type: "unitItem",
  });

  // 🆕 CREATE
  if (!item) {
    if (hasThreshold && lowStockThreshold >= quantity) {
      throw new Error("Threshold must be smaller than stock");
    }

    return await Item.create({
      itemName: normalizedName,
      displayName: formatName(itemName),
      type: "unitItem",
      unit: "piece",
      lowStockThreshold: hasThreshold ? lowStockThreshold : 0,
      stockEntries: [
        {
          costPrice,
          sellingPrice,
          quantity,
        },
      ],
    });
  }

  // 🧠 Calculate total stock
  const existingTotalStock = item.stockEntries.reduce(
    (sum, e) => sum + e.quantity,
    0,
  );

  const newTotalStock = existingTotalStock + quantity;

  if (hasThreshold && lowStockThreshold >= newTotalStock) {
    throw new Error("Threshold must be smaller than total stock");
  }

  // 🔄 UPDATE
  const existingEntry = item.stockEntries.find(
    (entry) => Math.abs(entry.sellingPrice - sellingPrice) < 0.001,
  );

  if (existingEntry) {
    const totalQty = existingEntry.quantity + quantity;

    // 🔥 weighted avg cost (CRITICAL FIX APPLIED)
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

  // ✅ Update threshold ONLY if provided
  if (hasThreshold) {
    item.lowStockThreshold = lowStockThreshold;
  }

  await item.save();

  return item;
};

export const getAllItemsService = async (queryParams) => {
  const { search = "", type } = queryParams;

  const query = {
    displayName: { $regex: search, $options: "i" },
  };

  if (type) {
    query.type = type;
  }

  const items = await Item.find(query).limit(10);

  // 🔥 clean transformation
  return items.flatMap(formatItemResponse);
};

export const getItemsTableService = async () => {
  const items = await Item.find().lean();

  return items.flatMap(formatItemTable);
};

export const getLowStockItemsService = async () => {
  const items = await Item.find().lean({ virtuals: true });

  // ✅ no need for .toObject() now
  return items
    .filter((item) => item.isLowStock)
    .map((item) => ({
      _id: item._id,
      displayName: item.displayName,
      stock: item.totalStock,
      unit: item.unit,

      // 🔥 clearer naming
      outOfStock: item.outOfStockVariants?.length > 0,

      variants: item.outOfStockVariants || [],
    }));
};
