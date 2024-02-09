import mongoose from "mongoose";
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual Attribute
  age: number;
}
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please Enter Id"],
    },
    name: {
      type: String,
      required: [true, "Please Enter Name"],
    },
    email: {
      type: String,
      unique: [true, "Email Already Exist"],
      required: [true, "Please Enter Name"],
    },
    photo: {
      type: String,
      required: [true, "Please add Photo"],
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please Enter Gender"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    dob: {
      type: Date,
      required: [true, "Please Enter Date od Birth"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob: Date = this.dob;

  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
});
export const User = mongoose.model<IUser>("User", userSchema);
