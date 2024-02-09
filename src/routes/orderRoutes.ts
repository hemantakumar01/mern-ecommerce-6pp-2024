import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  myOrder,
  processOrder,
  singleOrder,
} from "../controller/orderController.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router();
app.post("/latest", createOrder);
app.get("/all", adminOnly, getAllOrders);
app.get("/my/:id", myOrder);
app
  .route("/:id")
  .get(adminOnly, singleOrder)
  .put(adminOnly, processOrder)
  .delete(adminOnly, deleteOrder);
export default app;
