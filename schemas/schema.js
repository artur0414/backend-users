import { z } from "zod";

const userSchema = z.object({
  username: z.string().min(5).max(20),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const validateApi = (input) => {
  return userSchema.safeParse(input);
};

export const validatePartialApi = (input) => {
  return userSchema.partial().safeParse(input);
};
