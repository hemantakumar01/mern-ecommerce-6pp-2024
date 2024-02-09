import { timeStamp } from "console";
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      require: [true, "Please Enter Coupon Code"],
      unique: [true, "Code Already Exist"],
    },
    price: {
      type: Number,
      require: [true, "Please Enter Price"],
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("coupon", schema);
export default Coupon;
