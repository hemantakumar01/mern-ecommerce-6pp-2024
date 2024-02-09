import express from "express";
import { errorMiddleware } from "./middleware/error.js";
import connectToDb from "./utils/connectToDb.js";
import { config } from "dotenv";
import Stripe from "stripe";
import cors from "cors";

// Importing Routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoute from "./routes/paymentRoutes.js";
import statsRoute from "./routes/stactRoute.js";
import NodeCache from "node-cache";
import morgan from "morgan";
config({ path: "./.env" });

const port = process.env.PORT || 4000;
const url = process.env.MONGO_URL;
const stripeKey = process.env.STRIPEKEY || "";
export const stripe = new Stripe(stripeKey);
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
export const myCache = new NodeCache();
// Useing ROutes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", couponRoute);
app.use("/api/v1/stats", statsRoute);
app.get("/", (req, res) => {
  res.status(200).send("App is Gettin in /");
});
// Static Route
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
connectToDb(url as string);
app.listen(port, () => {
  console.log(`Server is working in http://localhost:${port}`);
});
