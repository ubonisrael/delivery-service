import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    manufacturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wholesalerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    distance: { type: Number, required: true },
    fee: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
