import express from "express";
import {
  getBarChats,
  getDashboardStats,
  getLineChats,
  getPieChats,
} from "../controller/stactc.js";
const app = express();

app.get("/stats", getDashboardStats);
app.get("/pie", getPieChats);
app.get("/bars", getBarChats);
app.get("/line", getLineChats);

export default app;
