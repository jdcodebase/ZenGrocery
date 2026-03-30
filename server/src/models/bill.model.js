import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        itemName: String,

        quantitySold: Number, // kg or units

        totalPrice: Number, // ✅ renamed
        profit: Number,

        unit: String,

        // ✅ snapshots (VERY IMPORTANT)
        sellingPrice: Number,
        costPerKg: Number,
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },
    totalProfit: {
      type: Number,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Bill", billSchema);
