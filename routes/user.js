// Inicializa el router de express y lo exporta, define las rutas de los endpoints de la API

import { Router } from "express";
import { UserController } from "../controllers/user.js";
import { authToken, authorizeAdmin } from "../middlewares/authToken.js";

export const createRouter = ({ userModel }) => {
  const userRouter = Router();

  const userController = new UserController({ userModel });

  //ruta para registrar un usuario, solo valida si el usuario es admin
  userRouter.post(
    "/register",
    authToken,
    authorizeAdmin,
    userController.create
  );

  //ruta para obtener todos los usuarios, solo valida si el usuario es admin
  userRouter.get("/getall", authToken, authorizeAdmin, userController.getAll);

  //ruta para iniciar sesion
  userRouter.post("/login", userController.login);

  // ruta para cerrar sesion
  userRouter.post("/logout", userController.logout);

  //ruta para eliminar un usuario, solo valida si el usuario es admin
  userRouter.delete(
    "/delete/:id",
    authToken,
    authorizeAdmin,
    userController.delete
  );

  //Rutas de actualización de contraseña
  userRouter.post("/forgot", userController.forgotPassword); //Ruta inicial para restablecer contraseña
  userRouter.post("/recover", userController.recover); //Ruta para configurar código de restablecimiento de contraseña
  userRouter.patch("/update", userController.updatePassword); //Ruta para actualizar contraseña

  //ruta para actualizar el rol de un usuario, solo valida si el usuario es admin
  userRouter.patch(
    "/update-role",
    authToken,
    authorizeAdmin,
    userController.updateRole
  );

  //Ruta para actualizar contraseña de un usuario

  userRouter.patch(
    "/update-password",
    authToken,
    userController.updatePassword
  );

  // ruta para página protegida

  userRouter.get("/protected", authToken, userController.protected);

  return userRouter;
};
