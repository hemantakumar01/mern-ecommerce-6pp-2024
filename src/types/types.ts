import { NextFunction, Request, Response } from "express";

export type NewUserRequesBody = {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: string;
  gender: string;
  dob: Date;

  age: number;
};
export type NewProductRequesBody = {
  name: string;
  category: string;
  price: Number;
  stock: Number;
};
export type ShortProductRequesBody = {
  search?: string;
  category?: string;
  price?: number;
  stock?: number;
  page?: number;
  sort?: string;
};

export type ErrorFuncType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type BaseQueryFilter = {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
};

export type InvalidatePropType = {
  order?: boolean;
  product?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
};

export type orderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};
export type shippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
};
export type orderBodyType = {
  shippingInfo: shippingInfoType;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  user: string;
  subTotal: number;
  tax: number;
  total: number;
  shippingCharges: number;
  discount: number;
  orderItem: orderItemType[];
};
