import { Router } from "express";
import { lampOptions } from "../data/lampOptions.js";

export const lampRoutes = Router();

lampRoutes.get("/", (req, res) => {
  res.json({ data: lampOptions });
});
