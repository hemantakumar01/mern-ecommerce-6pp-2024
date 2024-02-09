import mongoose from "mongoose";

const connectToDb = (url: string) => {
  mongoose
    .connect(url, { dbName: "Ecommerce-2024-6pp" })
    .then((c) => {
      console.log(`DB connected To ${c.connection.host}`);
    })
    .catch((e) => {
      console.log(e);
    });
};
export default connectToDb;
