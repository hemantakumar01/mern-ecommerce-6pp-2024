import { User } from "../modules/userModule.js";
import ErrorHandler from "../utils/utility-classes.js";
import { TryCatch } from "./error.js";

export const adminOnly = TryCatch(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Login First", 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("Invalid Id", 400));
  }
  if (user.role !== "admin") {
    return next(new ErrorHandler("Not Allowed", 400));
  }
  next();
});
