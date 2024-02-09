import express from "express";
import {
  allCoupons,
  applyDiscount,
  createStripeIntend,
  deleteCoupons,
  newCoupon,
} from "../controller/paymentController.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router();
app.post("/create", createStripeIntend);
app.get("/discount", applyDiscount);
app.post("/coupon/new", adminOnly, newCoupon);
app.get("/coupon/all", adminOnly, allCoupons);
app.delete("/coupon/:id", adminOnly, deleteCoupons);
export default app;
