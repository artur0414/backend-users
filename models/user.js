import { dbConfig } from "../config.js";
import mysql2 from "mysql2/promise";

const config = dbConfig;

const connection = await mysql2.createConnection(config);

export class UserModel {
  static async create({ name, username, email, password, role }) {
    try {
      const [result] = await connection.query(
        "INSERT INTO user (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [name, username, email, password, role]
      );

      return {
        name: name,
        username: username,
        email: email,
        password: password,
        role: role,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getAll() {
    try {
      const [users] = await connection.query("SELECT * FROM user");
      return users.map((row) => row);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async login(input) {
    try {
      let result;
      if (input.email) {
        [result] = await connection.query(
          "SELECT * FROM user WHERE email = ?",
          [input.email]
        );
      } else if (input.username) {
        [result] = await connection.query(
          "SELECT * FROM user WHERE username = ?",
          [input.username]
        );
      }

      if (result.length === 0) {
        return false;
      }

      return {
        name: result[0].name,
        username: result[0].username,
        email: result[0].email,
        password: result[0].password,
        role: result[0].role,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  static async delete(id) {
    try {
      const [result] = await connection.query("DELETE FROM user WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) return false;

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async forgotPassword({ email, code }) {
    try {
      const [result] = await connection.query(
        "SELECT * FROM user WHERE email = ?",
        [email]
      );

      if (result.length === 0) {
        return false;
      }

      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 10); // Establecer la expiración en 10 minutos

      await connection.query(
        "UPDATE user SET code = ?, code_expiration = ? WHERE email = ?",
        [code, expirationDate, email] // Actualiza el código y la fecha de expiración
      );

      return {
        username: result[0].username,
        email: result[0].email,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  static async recover(username, code) {
    try {
      const [result] = await connection.query(
        "SELECT * from user WHERE username = ?",
        [username]
      );

      if (result.length === 0) {
        return false;
      }

      return result[0].code;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async updatePassword({ password, username }) {
    try {
      const [result] = await connection.query(
        "UPDATE user SET password = ? WHERE username = ?",
        [password, username]
      );

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }
}
