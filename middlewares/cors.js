//Habilitar CORS para aceptar solicitudes de origen cruzado de un dominio específico

import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "https://frontend-users-4iey6mj43-arturo-acostas-projects.vercel.app",
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
  });
};
