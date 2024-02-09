import { Request } from "express";
import { TryCatch } from "../middleware/error.js";
import { Product } from "../modules/productModule.js";
import ErrorHandler from "../utils/utility-classes.js";
import { rm } from "fs";
import { BaseQueryFilter, ShortProductRequesBody } from "../types/types.js";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

export const newProduct = TryCatch(async (req, res, next) => {
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  if (!photo) {
    return next(new ErrorHandler("Please Add Photo", 400));
  }
  if (!name || !price || !stock || !category) {
    rm(photo.path, () => {});
    return next(new ErrorHandler("Please Enter All Fields", 400));
  }
  await Product.create({
    name,
    price,
    stock,
    category,
    photo: photo?.path.toLowerCase(),
  });
  await invalidateCache({ product: true, admin: true });

  return res.status(201).send({
    success: true,
    message: "Product Created Successfully",
  });
});
// Revalidate on New, Delete or Update Product & on New Order
export const getFeaturedProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("featured-product")) {
    products = JSON.parse(myCache.get("featured-product") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("featured-product", JSON.stringify(products));
  }

  return res.status(200).send({
    success: true,
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).send({
    success: true,
    categories,
  });
});

export const getAdminProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("admin-products")) {
    products = JSON.parse(myCache.get("admin-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("admin-products", JSON.stringify(products));
  }
  return res.status(200).send({
    success: true,
    products,
  });
});
export const singleProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Invalid Id", 400));
  let product;
  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("product Not Found", 400));
    }
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).send({
    success: true,
    product,
  });
});
export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  if (!id) return next(new ErrorHandler("Invalid Id", 400));

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("product Not Found", 400));
  }

  if (photo) {
    rm(product.photo, () => {
      console.log("Old Photo Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (stock) product.stock = stock;
  if (price) product.price = price;
  if (category) product.category = category;
  await product.save();
  await invalidateCache({ product: true, admin: true });
  return res.status(200).send({
    success: true,
    message: "Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new ErrorHandler("Invalid Id", 400));

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("product Not Found", 400));
  }

  rm(product.photo, () => {
    console.log("Old Photo Deleted");
  });

  await product.deleteOne();
  await invalidateCache({ product: true, admin: true });

  return res.status(200).send({
    success: true,
    message: "Deleted Successfully",
  });
});

export const getAllProduct = TryCatch(
  async (req: Request<{}, {}, {}, ShortProductRequesBody>, res, next) => {
    const { search, price, category, stock, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery: BaseQueryFilter = {};
    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    if (price) baseQuery.price = { $lte: Number(price) };
    if (category) baseQuery.category = category;
    const productPromiseArrayItem = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);
    const [product, filteredProduct] = await Promise.all([
      productPromiseArrayItem,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredProduct.length / limit);
    return res.status(200).send({
      success: true,
      product,
      totalPage,
    });
  }
);
