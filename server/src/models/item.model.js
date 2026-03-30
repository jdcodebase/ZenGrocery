import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
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

    buyingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    costPerKg: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["kg", "g", "piece"],
      default: "kg",
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

itemSchema.virtual("profitPerKg").get(function () {
  return this.sellingPrice - this.costPerKg;
});

itemSchema.virtual("margin").get(function () {
  if (!this.costPerKg) return 0;
  return ((this.sellingPrice - this.costPerKg) / this.costPerKg) * 100;
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
