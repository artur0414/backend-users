import { z } from "zod";

const userSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es obligatorio", // Mensaje para campo requerido
      invalid_type_error: "El nombre debe ser una cadena de texto", // Mensaje para tipo inválido
    })
    .min(5, {
      message: "El nombre debe tener al menos 5 caracteres",
    })
    .max(100, {
      message: "El nombre debe tener menos de 100 caracteres",
    }),

  username: z
    .string({
      required_error: "El nombre de usuario es obligatorio", // Mensaje para campo requerido
      invalid_type_error: "El nombre de usuario debe ser una cadena de texto", // Mensaje para tipo inválido
    })
    .min(5, {
      message: "El nombre de usuario debe tener al menos 5 caracteres",
    })
    .max(20, {
      message: "El nombre de usuario debe tener como máximo 20 caracteres",
    }),

  email: z
    .string({
      required_error: "El email es obligatorio", // Mensaje para campo requerido
    })
    .email({
      message: "El email debe ser un email válido",
    }),

  password: z
    .string({
      required_error: "La contraseña es obligatoria", // Mensaje para campo requerido
      invalid_type_error: "La contraseña debe ser una cadena de texto", // Mensaje para tipo inválido
    })
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    })
    .max(100, {
      message: "La contraseña debe tener como máximo 100 caracteres",
    }),

  role: z
    .string({
      required_error: "El rol es obligatorio", // Mensaje para campo requerido
      invalid_type_error: "Rol tiene que ser una cadena de texto", // Mensaje para tipo inválido
    })
    .min(4, {
      message: "Rol debe tener al menos 4 caracteres",
    }),

  code: z
    .string({
      required_error: "El código es obligatorio", // Mensaje para campo requerido
      invalid_type_error: "El código debe ser una cadena de texto", // Mensaje para tipo inválido
    })
    .min(6, {
      message: "El código debe tener al menos 6 caracteres",
    })
    .optional(),
});

export const validateApi = (input) => {
  return userSchema.safeParse(input);
};

export const validatePartialApi = (input) => {
  return userSchema.partial().safeParse(input);
};
