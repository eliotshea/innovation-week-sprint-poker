import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, { message: "You must enter a name" })
    .min(3, { message: "Must be at least 3 characters long." }),
  id: z.string().uuid(),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
