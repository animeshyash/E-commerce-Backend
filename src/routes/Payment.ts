import express from "express";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
} from "../controllers/Payment.js";
import { adminOnly } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/coupon/new", adminOnly, newCoupon);
router.post("/create", createPaymentIntent);
router.get("/discount", applyDiscount);
router.get("/coupon/all", adminOnly, allCoupons);
router.delete("/coupon/:id", adminOnly, deleteCoupon);

export default router;
