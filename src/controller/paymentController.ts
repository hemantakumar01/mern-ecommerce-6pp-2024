import { TryCatch } from "../middleware/error.js";
import ErrorHandler from "../utils/utility-classes.js";
import Coupon from "../modules/coupon.js";
import { stripe } from "../app.js";
export const createStripeIntend = TryCatch(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount) return next(new ErrorHandler("Please Enter Amount", 400));
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
  });
  res.status(201).send({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});
export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, price } = req.body;

  if (!code || !price) {
    return next(new ErrorHandler("Please Enter All Fields"));
  }

  const couponCode = await Coupon.create({ code, price });
  return res.status(201).send({
    success: true,
    message: `Coupon ${couponCode.code} is Created `,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new ErrorHandler("Please Enter All Fields"));
  }
  const discount = await Coupon.findOne({ code });
  if (!discount) return next(new ErrorHandler("invalide Coupon Code", 404));
  return res.status(201).send({
    success: true,
    discount: discount?.price,
  });
});
export const allCoupons = TryCatch(async (req, res, next) => {
  const coupon = await Coupon.find({});
  if (!coupon) return next(new ErrorHandler("coupon not found", 400));
  return res.status(201).send({
    success: true,
    coupon,
  });
});
export const deleteCoupons = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("ID not found"));

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return next(new ErrorHandler("invalid ID", 400));

  return res.status(201).send({
    success: true,
    message: `coupon  deleted`,
  });
});
