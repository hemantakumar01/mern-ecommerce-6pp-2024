import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Name"],
    },

    photo: {
      type: String,
      required: [true, "Please add Photo"],
    },
    category: {
      type: String,
      required: [true, "Please Enter Category"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please Enter Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter Stock"],
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
