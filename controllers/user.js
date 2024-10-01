import { validateApi, validatePartialApi } from "../schemas/schema.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import { SECRET_JWT_KEY } from "../config.js";
import brevo from "@getbrevo/brevo";
import { SECRET_JWT_KEY_EMAIL } from "../config.js";

export class UserController {
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  create = async (req, res) => {
    try {
      const result = validateApi(req.body);

      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const hashedPassword = await bycrypt.hash(result.data.password, 10);

      const user = await this.userModel.create({
        name: result.data.name,
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
        role: result.data.role,
      });

      return res.json(user);
    } catch (error) {
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
        return res.status(400).json({ error: result.error.issues });
      }

      const user = await this.userModel.login(result.data);

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      if (!user.password) {
        return res.status(400).json({ error: "password not found" });
      }

      console.log(result.data.password);
      console.log(user.password);

      const isValid = await bycrypt.compare(
        result.data.password,
        user.password
      );

      if (!isValid) {
        return res.status(400).json({ error: "Invalid password" });
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
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  };

  logout = async (req, res) => {
    try {
      return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Logout successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await this.userModel.delete(id);

      if (!deleted) {
        return res.status(400).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const code = Math.floor(100000 + Math.random() * 900000);

      console.log("El código es este:", code);

      const user = await this.userModel.forgotPassword({
        email: result.data.email,
        code,
      });

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // send email with recover password

      const apiInstance = new brevo.TransactionalEmailsApi(); // Usa la clase correcta

      const apiKey = SECRET_JWT_KEY_EMAIL; // Obtén la clave de entorno
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

      const sendSmtEmail = new brevo.SendSmtpEmail(); // Usa SendSmtpEmail correctamente
      sendSmtEmail.subject = "Recover Password";
      sendSmtEmail.to = [{ email: user.email }];
      sendSmtEmail.htmlContent = `<p>Your recovery code is: <strong>${code}</p>`;
      sendSmtEmail.sender = { email: "artur.acost0414@gmail.com" };

      // Enviar el email
      await apiInstance.sendTransacEmail(sendSmtEmail);

      console.log(user.username);

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
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  };

  recover = async (req, res) => {
    try {
      const cookieCode = req.cookies.recoveryCode;

      console.log(cookieCode.username);

      if (!cookieCode.username) {
        return res.status(400).json({ error: "None access granted" });
      }

      const result = validatePartialApi(req.body);

      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const code = await this.userModel.recover(
        cookieCode.username,
        result.data.code
      );

      console.log(code);

      if (!code) return res.status(400).json({ error: "not access granted" });

      if (code !== result.data.code) {
        return res.status(400).json({ error: "Invalid code here" });
      }

      return res.status(200).json({ message: "Code is correct" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  };

  updatePassword = async (req, res) => {
    try {
      const result = validatePartialApi(req.body);

      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const cookieCode = req.cookies.recoveryCode;

      console.log("Updating password for user:", cookieCode.username);

      if (!cookieCode) {
        return res.status(400).json({ error: "None access granted" });
      }

      const hashedPassword = await bycrypt.hash(result.data.password, 10);

      await this.userModel.updatePassword({
        password: hashedPassword,
        username: cookieCode.username,
      });

      res.clearCookie("recoveryCode");

      return res.status(200).json({ message: "Password updated" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  };
}
