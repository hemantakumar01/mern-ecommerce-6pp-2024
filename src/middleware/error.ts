import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-classes.js";
import { ErrorFuncType } from "../types/types.js";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;
  if (err.name === "CastError") err.message = "invalid Id";
  res.status(err.statusCode).send({
    success: false,
    message: err.message,
  });
  console.log(err);
};

export const TryCatch = (func: ErrorFuncType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
};
