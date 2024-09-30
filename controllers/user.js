import { validateApi, validatePartialApi } from "../schemas/schema.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import { SECRET_JWT_KEY } from "../config.js";

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

      const token = jwt.sign(
        {
          name: user.name,
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
          secure: process.env.NODE_ENV === "production" || false, // Solo si estás en producción
          sameSite: "Lax",
          maxAge: 1000 * 60 * 60,
        })
        .status(201)
        .json({ user, token });
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

      const isValid = bycrypt.compare(result.data.password, user.password);

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
}
