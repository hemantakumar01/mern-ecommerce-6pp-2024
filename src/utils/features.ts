import { Document } from "mongoose";
import { myCache } from "../app.js";
import { Orders } from "../modules/orderModule.js";
import { Product } from "../modules/productModule.js";
import { InvalidatePropType, orderItemType } from "../types/types.js";

export const invalidateCache = async ({
  order,
  product,
  admin,
  userId,
  orderId,
}: InvalidatePropType) => {
  const productKey: string[] = [
    "featured-product",
    "categories",
    "admin-products",
  ];
  const allProduct = await Product.find({}).select("_id");
  allProduct.map((item) => {
    productKey.push(`product-${item._id}`);
  });
  myCache.del(productKey);
  if (order) {
    const orderKey: string[] = ["get-order", `order-${orderId}`];

    myCache.del(orderKey);
  }
  if (product) {
  }
  if (admin) {
    myCache.del([
      "admin-stats",
      "admin-admin-pie",
      "admin-line-chart",
      "admin-bar-chart",
    ]);
  }
};

export const reduceStock = async (orderItem: orderItemType[]) => {
  for (let i = 0; i < orderItem.length; i++) {
    const order = orderItem[i];
    const product = await Product.findById(order.productId);
    if (product) {
      product.stock -= order.quantity;
      await product.save();
    } else throw new Error("Product not Found");
  }
};

export const changePrecentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;

  return percent.toFixed(0);
};

export const getAllCategories = async ({
  categories,
  totalProduct,
}: {
  categories: string[];
  totalProduct: number;
}) => {
  const categoryCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const allCategoryArray = await Promise.all(categoryCountPromise);
  const categoryOfProducts: Record<string, number>[] = [];

  categories.forEach((categories, i) => {
    categoryOfProducts.push({
      [categories]: Math.round((allCategoryArray[i] / totalProduct) * 100),
    });
  });
  return categoryOfProducts;
};

interface DocType extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
type funct1Props = {
  today: Date;
  length: number;
  docArr: DocType[];
  property?: "total" | "discount";
};
export const funct1 = ({ today, length, docArr, property }: funct1Props) => {
  const data = new Array(length).fill(0);
  docArr.forEach((order) => {
    const creationDate = order.createdAt;
    const monthDifferent =
      (today.getMonth() - creationDate.getMonth() + 12) % 12;
    if (monthDifferent < length) {
      data[length - monthDifferent - 1] += property ? order[property] : 1;
    }
  });
  return data;
};
