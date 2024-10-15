// Modelo de usuario para la base de datos MySQL

import { dbConfig } from "../config.js";
import mysql2 from "mysql2/promise";
import {
  ServerError,
  DuplicateEntryError,
  ConnectionRefusedError,
} from "../errors.js";

const config = dbConfig;

const connection = await mysql2.createConnection(config);

export class UserModel {
  // Método para crear un usuario en la base de datos MySQL
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
      if (error.code === "ER_DUP_ENTRY") {
        throw new DuplicateEntryError(
          "El nombre de usuario o correo electrónico ya existen. Por favor, intenta con uno diferente."
        );
      } else if (error.code === "ECONNREFUSED") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      } else {
        throw new ServerError(
          "un error ocurrió mientras se creaba el usuario, por favor, intenta de nuevo."
        );
      }
    }
  }

  // Método para obtener todos los usuarios de la base de datos MySQL
  static async getAll() {
    try {
      const [users] = await connection.query("SELECT * FROM user");
      return users;
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      } else {
        throw new ServerError(
          "un error ocurrió mientras se obtenían los usuarios, por favor, intenta de nuevo."
        );
      }
    }
  }

  // Método para obtener un usuario por su ID de la base de datos MySQL
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
      if (error.code === "ECONNREFUSED") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      } else {
        throw new ServerError(
          "un error ocurrió mientras se intentaba iniciar sesión, por favor, intenta de nuevo."
        );
      }
    }
  }

  // Método para elimianr un usuario por su ID de la base de datos MySQL
  static async delete(id) {
    try {
      const [result] = await connection.query("DELETE FROM user WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === "ENOTFOUND") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      } else {
        throw new ServerError(
          "un error ocurrió mientras se intentaba eliminar el usuario, por favor, intenta de nuevo."
        );
      }
    }
  }

  // Método para seleccionar un usuario por su ID de la base de datos MySQL y enviar un correo electrónico si el usuario olvidó su contraseña
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
      if (error.code === "ECONNREFUSED") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      } else {
        throw new ServerError(
          "un error ocurrió mientras se intentaba recuperar la contraseña, por favor, intenta de nuevo."
        );
      }
    }
  }

  // Método para recuperar la contraseña de un usuario por su nombre de usuario de la base de datos MySQL y devolver el código y la fecha de expiración
  static async recover(username) {
    try {
      const [result] = await connection.query(
        "SELECT * from user WHERE username = ?",
        [username]
      );

      if (result.length === 0) {
        return false;
      }

      return {
        code: result[0].code,
        expirationCode: result[0].code_expiration,
      };
    } catch (error) {
      if (error.code === "ENOTFOUND") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      }
      throw new Error(error);
    }
  }

  // Método para actualizar la contraseña de un usuario por su nombre de usuario de la base de datos MySQL
  static async updatePassword({ password, username }) {
    try {
      const [result] = await connection.query(
        "UPDATE user SET password = ? WHERE username = ?",
        [password, username]
      );

      return true;
    } catch (error) {
      if (error.code === "ENOTFOUND") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      }

      throw new ServerError(
        "un error ocurrió mientras se intentaba actualizar la contraseña, por favor, intenta de nuevo."
      );
    }
  }

  // Método para actualizar el rol de un usuario por su nombre de usuario de la base de datos MySQL
  static async updateRole(input) {
    try {
      if (input.role !== "user" && input.role !== "admin") {
        throw new Error("Invalid role");
      }

      const [result] = await connection.query(
        "UPDATE user SET role = ? WHERE username = ?",
        [input.role, input.username]
      );

      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === "ENOTFOUND") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      }

      throw new ServerError(
        "un error ocurrió mientras se intentaba actualizar el rol, por favor, intenta de nuevo."
      );
    }
  }

  static async updateCurrentPassword({ password, username }) {
    try {
      const [result] = await connection.query(
        "UPDATE user SET password = ? WHERE username = ?",
        [password, username]
      );

      return;
    } catch (error) {
      if (error.code === "ENOTFOUND") {
        throw new ConnectionRefusedError(
          "Un error ocurrió. Por favor, contacte al administrador."
        );
      }

      throw new ServerError(
        "un error ocurrió mientras se intentaba actualizar la contraseña, por favor, intenta de nuevo."
      );
    }
  }
}
