import { NextFunction, Request, Response } from "express";
import { User } from "../modules/userModule.js";
import { NewUserRequesBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-classes.js";
import { TryCatch } from "../middleware/error.js";

export const createUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequesBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, _id, dob, photo, gender } = req.body;
    let user = await User.findById({ _id });
    if (user)
      return res.status(200).send({
        success: true,
        message: `welcome again ${user.name}`,
      });
    if (!name || !email || !_id || !dob || !photo || !gender) {
      return next(new ErrorHandler("Enter All Fields", 400));
    }
    user = await User.create({ name, email, _id, dob, photo, gender });

    res.status(200).send({
      success: true,
      message: `welcome ${user.name}`,
    });
  }
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).send({
    success: true,
    users,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.status(200).send({
      success: true,
      user,
    });
  } else {
    return next(new ErrorHandler("User Not Found", 400));
  }
});

export const deleteUser = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.status(200).send({
      success: true,
      message: "User Deleted",
    });
  } else {
    return next(new ErrorHandler("User Not Found", 400));
  }
});
