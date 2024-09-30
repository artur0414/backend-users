import { Router } from "express";
import { UserController } from "../controllers/user.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authToken.js";

export const createRouter = ({ userModel }) => {
  const userRouter = Router();

  const userController = new UserController({ userModel });

  userRouter.post("/register", userController.create);
  userRouter.get(
    "/getall",
    authenticateToken,
    authorizeAdmin,
    userController.getAll
  );

  userRouter.post("/login", userController.login);

  return userRouter;
};
