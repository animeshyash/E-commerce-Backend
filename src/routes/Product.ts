import express from "express";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getLatestProduct,
  getProduct,
  newProduct,
  updateProduct,
} from "../controllers/Product.js";
import { singleUpload } from "../middlewares/Multer.js";
import { adminOnly } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/new", adminOnly, singleUpload, newProduct);
router.get("/latest", getLatestProduct);
router.get("/all", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/admin-products", adminOnly, getAdminProducts);
router.get("/:id", getProduct);
router.put("/:id", adminOnly, singleUpload, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);

export default router;
