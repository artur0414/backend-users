import { dbConfig } from "../config.js";
import mysql2 from "mysql2/promise";

const config = dbConfig;

const connection = await mysql2.createConnection(config);

export class UserModel {
  static async create({ username, email, password }) {
    try {
      const [result] = await connection.query(
        "INSERT INTO user (username, email, password, role) VALUES (?, ?, ?)",
        [username, email, password]
      );

      return {
        username: username,
        email: email,
        password: password,
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
}
