import express from "express";
import { PORT } from "./config.js";
import { corsMiddleware } from "./middlewares/cors.js";
import cookieParser from "cookie-parser";
import { createRouter } from "./routes/user.js";

export const createApp = ({ userModel }) => {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json());
  app.use(cookieParser());

  app.use("/", createRouter({ userModel }));

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
