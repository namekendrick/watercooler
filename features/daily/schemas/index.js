import * as z from "zod";

export const saveResponseSchema = z.object({
  text: z.string().trim().min(1, { message: "Please enter a response" }),
});
