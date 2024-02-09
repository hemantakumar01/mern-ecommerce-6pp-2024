import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
} from "../controller/userContrioler.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router();

app.post("/user", createUser);
app.get("/all", adminOnly, getAllUsers);
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default app;
