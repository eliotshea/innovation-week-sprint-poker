import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  vote: z.number().nullable(),
});

const RoomSchema = z.object({
  roomId: z.string(),
  leader: UserSchema,
  members: z.array(UserSchema),
});

type User = z.infer<typeof UserSchema>;
type Room = z.infer<typeof RoomSchema>;

export type { User, Room };
export { UserSchema, RoomSchema };
