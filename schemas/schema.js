import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(5).max(100),
  username: z.string().min(5).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.string().min(4),
  code: z.string().min(6).optional(),
});

export const validateApi = (input) => {
  return userSchema.safeParse(input);
};

export const validatePartialApi = (input) => {
  return userSchema.partial().safeParse(input);
};
