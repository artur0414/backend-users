//Archivo que contiene la logica de las rutas para el usuario

import { validateApi, validatePartialApi } from "../schemas/schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET_JWT_KEY } from "../config.js";
import { sendEmail } from "../email.js";
import {
  ServerError,
  DuplicateEntryError,
  ConnectionRefusedError,
} from "../errors.js";

export class UserController {
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  //crear un nuevo usuario, valida los datos y encripta la contraseña
  create = async (req, res) => {
    try {
      const result = validateApi(req.body);

      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }

      const hashedPassword = await bcrypt.hash(result.data.password, 10);

      const user = await this.userModel.create({
        name: result.data.name,
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
        role: result.data.role,
      });

      return res.json(user);
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //obtiene todos los usuarios

  getAll = async (req, res) => {
    try {
      const users = await this.userModel.getAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  //iniciar sesion, valida los datos y compara la contraseña encriptada, si todo es correcto genera un token jwt y lo envia en una cookie al cliente para mantener la sesion
  login = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }

      const user = await this.userModel.login(result.data);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const isValid = await bcrypt.compare(result.data.password, user.password);

      if (!isValid) {
        throw new Error("Contraseña Incorrecta");
      }

      const token = jwt.sign(
        {
          name: user.name,
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          password: user.password,
        },
        SECRET_JWT_KEY,
        { expiresIn: "2h" }
      );

      return res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: "none",
          partitioned: true, // Esto es clave para iOS
          maxAge: 1000 * 60 * 60 * 2,
        })
        .status(200)
        .json({ user, token });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //cierra la sesion eliminando la cookie que contiene el token jwt
  logout = async (req, res) => {
    try {
      if (!req.cookies.access_token) {
        throw new Error("La sesión ya ha sido cerrada");
      }

      return res
        .clearCookie("access_token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          partitioned: true, // Esto es clave para iOS
          sameSite: "none",
        })
        .status(200)
        .json({ message: "Sesión cerrada con éxito" });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //elimina un usuario por su id como parametro

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await this.userModel.delete(id);

      if (!deleted) {
        throw new Error("Usuario no encontrado");
      }
      return res
        .status(200)
        .json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  //ruta para actualizar la contraseña, valida los datos y envia un correo con un codigo de recuperacion
  forgotPassword = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }

      const code = Math.floor(100000 + Math.random() * 900000);

      const user = await this.userModel.forgotPassword({
        email: result.data.email,
        code: code,
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      if (user.username !== result.data.username) {
        throw new Error("Usuario no encontrado");
      }

      // send email with recover password

      await sendEmail(user.email, code);

      res
        .cookie(
          "recoveryCode",
          { username: user.username },
          {
            httpOnly: true,
            maxAge: 10 * 60 * 1000,
            secure: process.env.NODE_ENV === "production" ? true : false,
            partitioned: true, // Esto es clave para iOS
            sameSite: "none",
          }
        )
        .json({
          message: "Recovery code sent successfully",
          username: user.username,
        });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //ruta para validar el codigo de recuperacion y actualizar la contraseña
  recover = async (req, res) => {
    try {
      const cookieCode = req.cookies.recoveryCode;

      if (!cookieCode.username) {
        throw new Error("Acceso denegado, por favor solicita un nuevo código");
      }

      const result = validatePartialApi(req.body);

      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }

      const code = await this.userModel.recover(cookieCode.username);

      if (!code) {
        throw new Error(
          "No se pudo recuperar tu código de recuperación. Por favor, solicita un nuevo código."
        );
      }

      if (code.code !== result.data.code) {
        throw new Error("Código incorrecto");
      }

      if (code.expirationCode < new Date()) {
        throw new Error("Código expirado, por favor solicita uno nuevo");
      }

      return res.status(200).json({ message: "Código correcto" });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //actualiza la contraseña, valida los datos y encripta la nueva contraseña

  updatePassword = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);

      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }
      const cookieCode = req.cookies.recoveryCode;

      if (!cookieCode) {
        throw new Error("Acceso denegado, por favor solicita un nuevo código");
      }

      const hashedPassword = await bcrypt.hash(result.data.password, 10);

      await this.userModel.updatePassword({
        password: hashedPassword,
        username: cookieCode.username,
      });

      res.clearCookie("recoveryCode", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        partitioned: true, // Esto es clave para iOS
        sameSite: "none",
      });

      return res.status(200).json({ message: "Password updated" });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //actualiza el rol de un usuario, valida los datos y actualiza el rol

  updateRole = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }
      const rolUpdated = await this.userModel.updateRole(result.data);

      if (!rolUpdated) {
        throw new Error("Usuario no encontrado");
      }

      return res.status(200).json({ message: "Role updated" });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };

  //ruta protegida, valida el token jwt y devuelve el usuario que esta logueado

  protected = async (req, res) => {
    try {
      const user = req.user;
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  //actualiza la contraseña, valida los datos y encripta la nueva contraseña

  updateCurrentPassword = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);

      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (error) =>
            error.message || error.invalid_type_error || "Error de validación"
        );

        throw new Error(errorMessages.join(", "));
      }

      const isValid = await bcrypt.compare(
        result.data.password,
        req.user.password
      );

      if (!isValid) {
        throw new Error("Contraseña incorrecta");
      }

      const hashedPassword = await bcrypt.hash(result.data.newPassword, 10);

      await this.userModel.updateCurrentPassword({
        password: hashedPassword,
        username: req.user.username,
      });

      return res.status(200).json({ message: "Contraseña actualizada" });
    } catch (error) {
      if (
        error instanceof ServerError ||
        error instanceof DuplicateEntryError ||
        error instanceof ConnectionRefusedError
      ) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  };
}
