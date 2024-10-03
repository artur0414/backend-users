// Middleware para autenticar y autorizar a los usuarios

import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config.js";

export function authToken(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    if (!data) {
      return res.status(401).json({ error: "No autorizado" });
    }

    req.user = data;
    next();
  } catch (error) {
    return res.status(401).json({ error: "No autorizado" });
  }
}

export function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(401).json({ error: "No autorizado" });
  }

  next();
}
