import { Request } from "express";
import { TryCatch } from "../middlewares/Error.js";
import { NewOrderRequestBody } from "../types/Types.js";
import { reduceStock } from "../utils/Features.js";
import Status from "../utils/Status.js";
import { Order } from "../models/Order.js";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
      return next(new Status("Please Fill all the Details", 400));

    await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

export const myOrder = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  let orders = [];

  orders = await Order.find({ user });

  return res.status(200).json({
    success: true,
    message: "Order details fetched Successfully",
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  let orders = [];

  orders = await Order.find().populate("user", "name");

  return res.status(200).json({
    success: true,
    message: "All Orders fetched Successfully",
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  let order;

  order = await Order.findById(id).populate("user", "name");

  if (!order) return next(new Status("Order not Found", 400));

  return res.status(200).json({
    success: true,
    message: "Order fetched Successfully",
    order,
  });
});

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new Status("Order not Found", 400));

  if (order.status === "Processing") order.status = "Shipped";
  else if (order.status === "Shipped") order.status = "Delivered";
  else order.status = "Delivered";

  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order updated Successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new Status("Order not Found", 400));

  await Order.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Order deleted Successfully",
  });
});
