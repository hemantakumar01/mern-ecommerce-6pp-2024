import express from "express";

import { singleUplode } from "../middleware/multer.js";
import {
  deleteProduct,
  getAdminProduct,
  getAllCategories,
  getAllProduct,
  getFeaturedProduct,
  newProduct,
  singleProduct,
  updateProduct,
} from "../controller/productController.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router();

app.post("/new", singleUplode, newProduct);
app.get("/feature", getFeaturedProduct);
app.get("/categories", getAllCategories);
app.get("/admin-product", adminOnly, getAdminProduct);
app.get("/all", getAllProduct);

app
  .route("/:id")
  .get(singleProduct)
  .put(singleUplode, updateProduct)
  .delete(deleteProduct);
// To GET All Product

export default app;
