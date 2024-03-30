import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the Name"],
    },
    photo: {
      type: String,
      required: [true, "Please add the Photo"],
    },
    price: {
      type: Number,
      required: [true, "Please enter the Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter the Stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter the Category"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", schema);
