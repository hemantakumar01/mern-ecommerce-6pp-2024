import { Request } from "express";
import { TryCatch } from "../middleware/error.js";
import { orderBodyType } from "../types/types.js";
import { Orders } from "../modules/orderModule.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-classes.js";
import { myCache } from "../app.js";

export const createOrder = TryCatch(
  async (req: Request<{}, {}, orderBodyType>, res, next) => {
    const {
      shippingInfo,
      shippingCharges,
      orderItem,
      total,
      tax,
      discount,
      subTotal,
      user,
    } = req.body;
    if (!shippingInfo || !orderItem || !total || !tax || !subTotal)
      return next(new ErrorHandler("Please Enter All Feilds", 400));
    const order = await Orders.create({
      shippingInfo,
      shippingCharges,
      orderItem,
      total,
      tax,
      discount,
      subTotal,
      user,
    });
    await reduceStock(orderItem);
    await invalidateCache({
      order: true,
      product: true,
      admin: true,
      userId: user,
    });
    res.status(201).send({
      success: true,
      message: "Order Created",
    });
  }
);

export const getAllOrders = TryCatch(async (req, res, next) => {
  let orders;
  const key = "get-order";
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Orders.find({});
    if (!orders) return next(new ErrorHandler("Orders Not Found", 400));
    myCache.set(key, JSON.stringify(orders));
  }
  res.status(200).send({
    success: true,
    orders,
  });
});

export const singleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;
  let order;
  if (myCache.has(key)) {
    order = JSON.parse(myCache.get(key) as string);
  } else {
    order = await Orders.findById(id).populate("user", "name");
    if (!order) return next(new ErrorHandler("Orders Not Found", 400));
    myCache.set(key, JSON.stringify(order));
  }
  res.status(200).send({
    success: true,
    order,
  });
});
export const myOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;
  console.log(id);
  let order;
  if (myCache.has(key)) {
    order = JSON.parse(myCache.get(key) as string);
  } else {
    order = await Orders.find({ user: id });
    if (!order) return next(new ErrorHandler("Orders Not Found", 400));
    myCache.set(key, JSON.stringify(order));
  }
  res.status(200).send({
    success: true,
    order,
  });
});

export const processOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const order = await Orders.findById(id);
  if (!order) return next(new ErrorHandler("Order Not Found", 400));
  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }
  await order.save();
  await invalidateCache({
    order: true,
    product: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });
  res.status(200).send({
    success: true,
    message: "Order Updated",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const order = await Orders.findById(id);
  if (!order) return next(new ErrorHandler("Order Not found", 400));
  await order.deleteOne();
  await invalidateCache({
    order: true,
    product: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });
  res.status(200).send({
    success: true,
    message: "Order Deleted",
  });
});
