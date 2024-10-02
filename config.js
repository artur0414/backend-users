// Este archivo es el encargado de manejar las variables de entorno y exportarlas

import { config } from "dotenv";

config();

export const {
  PORT = 1234,
  SECRET_JWT_KEY,
  SECRET_JWT_KEY_EMAIL,
} = process.env;

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
};
