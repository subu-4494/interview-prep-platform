import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userroutes.js";
import slotRoutes from "./routes/slotroutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/slots", slotRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Mock Interview Platform Backend Running 🚀");
});

export default app;
