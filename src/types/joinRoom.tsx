import { z } from "zod";

export const joinRoomSchema = z.object({
  name: z
    .string()
    .min(1, { message: "You must enter a name" })
    .min(3, { message: "Must be at least 3 characters long." }),
  room: z
    .string()
    .min(1, { message: "You must enter a room ID" })
    .max(8, { message: "Must be a valid room ID" })
    .refine(
      (value) => /^[a-zA-Z0-9]{8}$/.test(value),
      "Must be a valid room ID",
    ),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
