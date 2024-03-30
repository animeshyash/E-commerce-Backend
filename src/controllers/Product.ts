import { Request } from "express";
import { TryCatch } from "../middlewares/Error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/Types.js";
import { Product } from "../models/Product.js";
import Status from "../utils/Status.js";
import { rm } from "fs";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new Status("Please Add the Photo", 400));

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Deleted");
      });
      return next(new Status("Please Fill the Details", 400));
    }

    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    return res.status(201).json({
      success: true,
      message: "Product created Successfully",
    });
  }
);

export const getLatestProduct = TryCatch(async (req, res, next) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(5); // Sort on the basis of created At, where -1 -> Descending Order and 1 -> Ascending Order.

  return res.status(200).json({
    success: true,
    message: "Product Fetched Successfully",
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  const categories = await Product.distinct("category"); // Creates an array of Distinct Categories.
  return res.status(200).json({
    success: true,
    message: "Categories Fetched Successfully",
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  const products = await Product.find({});

  return res.status(200).json({
    success: true,
    message: "Product Fetched Successfully",
    products,
  });
});

export const getProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new Status("Product not Found", 400));

  return res.status(200).json({
    success: true,
    message: "Product Fetched Successfully",
    product,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) return next(new Status("Product not Found", 400));

  // Delete old photo, if new photo comes in request.
  if (photo) {
    rm(product.photo, () => {
      console.log("Old Photo Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new Status("Product not Found", 400));

  rm(product.photo, () => {
    console.log("Product Photo Deleted");
  });
  await product.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Product deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1); // To skip number of items.

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i", // Make it case Insensitive
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const products = await Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const filterProduct = await Product.find(baseQuery);

    const totalPage = Math.ceil(filterProduct.length / limit);

    return res.status(200).json({
      success: true,
      message: "Product Fetched Successfully",
      products,
      totalPage,
    });
  }
);
