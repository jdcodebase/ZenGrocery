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

        quantitySold: Number,

        totalPrice: Number,
        profit: Number,

        unit: String,

        // snapshots
        sellingPrice: Number,
        costPerKg: Number,
        costPrice: Number,
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
  },
  { timestamps: true },
);

export default mongoose.model("Bill", billSchema);
