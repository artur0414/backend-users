//Habilitar CORS para aceptar solicitudes de origen cruzado de un dominio específico

import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "https://front-end-cacao-api-users.vercel.app",
];

export const corsMiddleware = ({ acceptedCors = ACCEPTED_ORIGINS } = {}) => {
  return cors({
    origin: (origin, callback) => {
      if (acceptedCors.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  });
};
