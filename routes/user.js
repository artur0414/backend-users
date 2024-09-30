import { Router } from "express";
import { UserController } from "../controllers/user.js";

export const createRouter = ({ userModel }) => {
  const userRouter = Router();

  const userController = new UserController({ userModel });

  userRouter.post("/register", userController.create);

  return userRouter;
};
