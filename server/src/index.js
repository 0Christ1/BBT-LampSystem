import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDatabase } from "./config/database.js";
import { applicationRoutes } from "./routes/applicationRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { lampRoutes } from "./routes/lampRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const configuredOrigins = new Set(
  (process.env.CLIENT_ORIGINS || clientOrigin)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const localNetworkOrigin =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d+$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.has(origin) || localNetworkOrigin.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/lamp-options", lampRoutes);
app.use("/api/applications", applicationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: "服务器暂时无法处理申请，请稍后再试。"
  });
});

await connectDatabase();

app.listen(port, () => {
  console.info(`BBT Lamp System API running on http://localhost:${port}`);
});
