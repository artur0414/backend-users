//Habilitar CORS para aceptar solicitudes de origen cruzado de un dominio específico

import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "https://frontend-users-ho6g9prlm-arturo-acostas-projects.vercel.app",
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
