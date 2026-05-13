import { Router } from "express";
import { isDatabaseConnected } from "../config/database.js";

export const healthRoutes = Router();

healthRoutes.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "BBT Lamp System API",
    database: isDatabaseConnected() ? "mongodb" : "memory"
  });
});
