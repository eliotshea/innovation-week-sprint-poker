import { z } from "zod";

const VoteSchema = z.object({
  member: z.string(),
  points: z.number(),
});

const RoomSchema = z.object({
  roomId: z.string(),
  votes: z.array(VoteSchema),
});

type Vote = z.infer<typeof VoteSchema>;
type Room = z.infer<typeof RoomSchema>;

export type { Vote, Room };
export { VoteSchema, RoomSchema };
