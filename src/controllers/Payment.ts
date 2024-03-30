import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/Error.js";
import { Coupon } from "../models/Coupon.js";
import Status from "../utils/Status.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new Status("Please enter the Amount", 400));

  // The Amount entered here is always considered as the lowest amount of the respective currency. For e.g. -> Paise for INR, Cents for Dollar, etc.
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount)
    return next(new Status("Please fill the Details Completely", 400));

  await Coupon.create({ code: coupon, amount });

  return res.status(201).json({
    success: true,
    message: "Coupon created Successfully",
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new Status("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    message: "Coupon applied Successfully",
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    message: "All Coupons fetched Successfully",
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) return next(new Status("Invalid Coupon ID", 400));

  return res.status(200).json({
    success: true,
    message: "Coupon code deleted Successfully",
  });
});
