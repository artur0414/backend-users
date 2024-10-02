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

  getAll = async (req, res) => {
    try {
      const users = await this.userModel.getAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

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
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        SECRET_JWT_KEY
      );

      return res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" || false,
          sameSite: "Lax",
          maxAge: 1000 * 60 * 60,
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

  logout = async (req, res) => {
    try {
      if (!req.cookies.access_token) {
        throw new Error("La sesión ya ha sido cerrada");
      }

      return res
        .clearCookie("access_token")
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

      // send email with recover password

      await sendEmail(user.email, code);

      res
        .cookie(
          "recoveryCode",
          { username: user.username },
          {
            httpOnly: true,
            maxAge: 100 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
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

      res.clearCookie("recoveryCode");

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
      console.log(error);
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
