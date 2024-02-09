import { myCache } from "../app.js";
import { TryCatch } from "../middleware/error.js";
import moment from "moment";
import { Product } from "../modules/productModule.js";
import { Orders } from "../modules/orderModule.js";
import { User } from "../modules/userModule.js";
import { changePrecentage, funct1 } from "../utils/features.js";
import { getAllCategories } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};
  let key = "admin-stats";
  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const lastSixMonth = new Date();
    lastSixMonth.setMonth(lastSixMonth.getMonth() - 6);

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth()),
      end: Date.now(),
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth() - 1, 0),
    };
    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrderPromise = Orders.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthOrderPromise = Orders.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthUserPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const lastSixMonthOrdersPromise = Orders.find({
      createdAt: {
        $gte: lastSixMonth,
        $lte: today,
      },
    }).select(["createdAt", "total"]);
    const latestOrderPromise = Orders.find({})
      .select(["total", "status", "discount", "orderItem"])
      .limit(4);
    const [
      thisMonthProducts,
      lastMonthProducts,
      thisMonthOrder,
      lastMonthOrder,
      thisMonthUsers,
      lastMonthUser,
      totalProduct,
      totalUsers,
      totalOrder,
      lastSixMonthOrders,
      categories,
      maleCount,
      femaleCount,
      latestOrder,
    ] = await Promise.all([
      thisMonthProductsPromise,
      lastMonthProductsPromise,
      thisMonthOrderPromise,
      lastMonthOrderPromise,
      thisMonthUsersPromise,
      lastMonthUserPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Orders.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.find({}).distinct("category"),
      User.countDocuments({ gender: "male" }),
      User.countDocuments({ gender: "female" }),
      latestOrderPromise,
    ]);
    const changedProductPercentage = changePrecentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    );
    const changedOrderPercentage = changePrecentage(
      thisMonthOrder.length,
      lastMonthOrder.length
    );
    const changedUserPercentage = changePrecentage(
      thisMonthUsers.length,
      lastMonthUser.length
    );
    const revenue = totalOrder.reduce(
      (total, order) => total + order.total || 0,
      0
    );
    const orderMonthRevenue = new Array(6).fill(0);
    const orderMonthCount = new Array(6).fill(0);
    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDifferent =
        (today.getMonth() - creationDate.getMonth() + 12) % 12;
      if (monthDifferent < 6) {
        orderMonthCount[6 - monthDifferent - 1] += 1;
        orderMonthRevenue[6 - monthDifferent - 1] += order.total;
      }
    });

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
    const latestOrderArray = latestOrder.map((item) => {
      return {
        _id: item._id.toString(),
        quantity: item.orderItem.length,
        amount: item.total,
        status: item.status.toString(),
        discount: item.discount,
      };
    });
    const count = {
      revenue,
      order: totalOrder.length,
      product: totalProduct,
      users: totalUsers,
    };
    stats = {
      latestOrder: latestOrderArray,
      maleCount,
      femaleCount,
      categories: categoryOfProducts,
      chart: {
        order: orderMonthCount,
        revenue: orderMonthRevenue,
      },
      count,

      product: changedProductPercentage,
      order: changedOrderPercentage,
      user: changedUserPercentage,
    };

    myCache.set(key, JSON.stringify(stats));
  }
  res.status(200).send({
    success: true,
    stats,
  });
});
export const getPieChats = TryCatch(async (req, res, next) => {
  let chart = {};
  let key = "admin-admin-pie";
  if (myCache.has(key)) {
    chart = JSON.parse(myCache.get(key) as string);
  } else {
    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      products,
      outOfStock,
      allOrders,
      adminUser,
      customerUser,
      userAge,
    ] = await Promise.all([
      Orders.countDocuments({ status: "Processing" }),
      Orders.countDocuments({ status: "Shipped" }),
      Orders.countDocuments({ status: "Delivered" }),
      Product.find({}).distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Orders.find({}).select(["discount", "shippingCharges", "tax", "total"]),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      User.find().select("dob"),
    ]);
    const allCategories = await getAllCategories({
      categories,
      totalProduct: products,
    });
    const grossIncom = allOrders.reduce(
      (prev, order) => prev + order.total || 0,
      0
    );
    const discount = allOrders.reduce(
      (prev, order) => prev + order.discount || 0,
      0
    );
    const productionCost = allOrders.reduce(
      (prev, order) => prev + order.shippingCharges || 0,
      0
    );
    const burnt = allOrders.reduce((prev, order) => prev + order.tax || 0, 0);
    const marketingCost = Math.round(grossIncom * (30 / 100));
    const netMargin =
      grossIncom - discount - productionCost - burnt - marketingCost;

    const allUsers = {
      admin: adminUser,
      users: customerUser,
    };
    const userAgeType = {
      teen: userAge.filter((i) => i.age < 20).length,
      adult: userAge.filter((i) => i.age >= 20 && i.age < 40).length,
      old: userAge.filter((i) => i.age >= 40).length,
    };
    chart = {
      userAgeType,
      allUsers,
      revinewStats: {
        netMargin,
        discount,
        productionCost,
        burnt,
        marketingCost,
      },
      stock: {
        outOfStock,
        inStock: products - outOfStock,
      },
      status: {
        categories: allCategories,
        process: processingOrder,
        shipped: shippedOrder,
        delevered: deliveredOrder,
      },
    };
    myCache.set(key, JSON.stringify(chart));
  }
  res.status(200).send({
    success: true,
    chart,
  });
});
export const getLineChats = TryCatch(async (req, res, next) => {
  let chart;
  const key = "admin-line-chart";
  if (myCache.has(key)) {
    chart = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();

    const twelveMonth = new Date();

    twelveMonth.setMonth(twelveMonth.getMonth() - 12);
    const baseQuery = {
      createdAt: {
        $gte: twelveMonth,
        $lte: today,
      },
    };
    const twelveMonthProductsPromise =
      Product.find(baseQuery).select("createdAt");
    const twelveMonthOrderPromise = Orders.find(baseQuery).select([
      "createdAt",
      "discount",
      "total",
    ]);
    const twelveMonthUsersPromise = User.find(baseQuery).select("createdAt");
    const [twelveMonthProducts, twelveMonthOrder, twelveMonthUsers] =
      await Promise.all([
        twelveMonthProductsPromise,
        twelveMonthOrderPromise,
        twelveMonthUsersPromise,
      ]);
    const productData = funct1({
      today,
      length: 12,
      docArr: twelveMonthProducts,
    });

    const userData = funct1({ today, length: 12, docArr: twelveMonthUsers });
    const discount = funct1({
      today,
      length: 12,
      docArr: twelveMonthOrder,
      property: "discount",
    });
    const revenue = funct1({
      today,
      length: 12,
      docArr: twelveMonthOrder,
      property: "total",
    });
    chart = {
      product: productData,
      userData: userData,
      discount,
      revenue,
    };
    myCache.set(key, JSON.stringify(chart));
  }
  res.status(200).send({
    success: true,
    chart,
  });
});
export const getBarChats = TryCatch(async (req, res, next) => {
  let chart;
  const key = "admin-bar-chart";
  if (myCache.has(key)) {
    chart = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const lastSixMonth = new Date();
    const twelveMonth = new Date();
    lastSixMonth.setMonth(lastSixMonth.getMonth() - 6);
    twelveMonth.setMonth(twelveMonth.getMonth() - 12);
    const baseQuery = {
      createdAt: {
        $gte: lastSixMonth,
        $lte: today,
      },
    };
    const sixMonthProductsPromise = Product.find(baseQuery).select("createdAt");
    const sixMonthUserPromise = User.find(baseQuery).select("createdAt");
    const twelveMonthOrderPromise = Orders.find({
      createdAt: {
        $gte: twelveMonth,
        $lte: today,
      },
    }).select("createdAt");

    const [products, users, orders] = await Promise.all([
      sixMonthProductsPromise,
      sixMonthUserPromise,
      twelveMonthOrderPromise,
    ]);
    const getProductData = funct1({ today, length: 6, docArr: products });
    const getUserData = funct1({ today, length: 6, docArr: users });
    const getOrderData = funct1({ today, length: 12, docArr: orders });

    chart = {
      products: getProductData,
      users: getUserData,
      orders: getOrderData,
    };
    myCache.set(key, JSON.stringify(chart));
  }
  res.status(200).send({
    success: true,
    chart,
  });
});
// const today = new Date();

// const startOfThisMonth = new Date(
//   today.getFullYear(),
//   today.getMonth(),
//   0
// );

// console.log(moment(startOfThisMonth).format("DD MM YYYY hh:mm"));
