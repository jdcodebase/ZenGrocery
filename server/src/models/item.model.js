import mongoose from "mongoose";

const stockEntrySchema = new mongoose.Schema(
  {
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const itemSchema = new mongoose.Schema(
  {
    // 🔤 BASIC INFO
    itemName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["weighItem", "unitItem"],
      default: "weighItem",
    },

    unit: {
      type: String,
      enum: ["kg", "g", "piece"],
      default: "kg",
    },

    // ⚠️ COMMON
    lowStockThreshold: {
      type: Number,
      default: 0,
    },

    // 🟢 WEIGH ITEM FIELDS
    sellingPrice: {
      type: Number,
      min: 0,
    },

    stock: {
      type: Number,
      min: 0,
    },

    costPerKg: {
      type: Number,
      min: 0,
    },

    // 🔵 UNIT ITEM FIELDS (NEW 🔥)
    stockEntries: {
      type: [stockEntrySchema],
      default: [],
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

itemSchema.index({ itemName: 1, type: 1 }, { unique: true });

// 🧠 VIRTUALS

// Total stock (important for unit items)
itemSchema.virtual("totalStock").get(function () {
  if (this.type === "unitItem") {
    return this.stockEntries.reduce((sum, entry) => {
      return sum + entry.quantity;
    }, 0);
  }

  return this.stock || 0;
});

itemSchema.virtual("isLowStock").get(function () {
  if (this.type === "unitItem") {
    const totalStock = this.stockEntries.reduce(
      (sum, e) => sum + e.quantity,
      0,
    );

    const hasEmptyVariant = this.stockEntries.some((e) => e.quantity === 0);

    return totalStock <= this.lowStockThreshold || hasEmptyVariant;
  }

  return this.stock <= this.lowStockThreshold;
});

itemSchema.virtual("outOfStockVariants").get(function () {
  if (this.type !== "unitItem") return [];

  return this.stockEntries.filter((e) => e.quantity === 0);
});

// Profit (only for weigh items directly)
itemSchema.virtual("profitPerKg").get(function () {
  if (
    this.type !== "weighItem" ||
    this.sellingPrice == null ||
    this.costPerKg == null
  ) {
    return undefined;
  }

  return Number((this.sellingPrice - this.costPerKg).toFixed(2));
});

// Margin %
itemSchema.virtual("margin").get(function () {
  // 🟢 WEIGH ITEM
  if (this.type === "weighItem" && this.costPerKg > 0) {
    return Number(
      (((this.sellingPrice - this.costPerKg) / this.costPerKg) * 100).toFixed(
        2,
      ),
    );
  }

  // 🟡 UNIT ITEM
  if (this.type === "unitItem" && this.stockEntries.length > 0) {
    const totalCost = this.stockEntries.reduce(
      (sum, e) => sum + e.costPrice * e.quantity,
      0,
    );

    const totalSelling = this.stockEntries.reduce(
      (sum, e) => sum + e.sellingPrice * e.quantity,
      0,
    );

    return totalCost
      ? Number((((totalSelling - totalCost) / totalCost) * 100).toFixed(2))
      : 0;
  }

  return undefined;
});

// 🛑 VALIDATION
itemSchema.pre("save", function () {
  // Weigh item validation
  if (this.type === "weighItem") {
    if (!this.costPerKg) {
      throw new Error("costPerKg required for weighItem");
    }

    if (this.sellingPrice == null) {
      throw new Error("sellingPrice required for weighItem");
    }

    if (this.stock == null) {
      throw new Error("stock required for weighItem");
    }
  }

  // Unit item validation
  if (this.type === "unitItem") {
    if (!this.stockEntries || this.stockEntries.length === 0) {
      throw new Error("stockEntries required for unitItem");
    }
  }
});

// 🔥 OPTIONAL: clean empty stock entries

const Item = mongoose.model("Item", itemSchema);

export default Item;
