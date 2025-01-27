import { Room } from "~/types/room.schema";
import { kv } from "@vercel/kv";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createRoomSchema } from "~/types/createRoom.schema";
import { joinRoomSchema } from "~/types/joinRoom.schema";
import { randomString } from "~/utils/util";

export const roomRouter = createTRPCRouter({
  create: publicProcedure
    .input(createRoomSchema)
    .mutation(async ({ input }) => {
      try {
        console.log("create room", input);
        const roomId = randomString(8);
        const room: Room = {
          roomId: roomId,
          leader: {
            id: input.id,
            name: input.name,
            vote: null,
          },
          members: [],
        };
        await kv.set<Room>(`room-${roomId}`, room, { ex: 60 * 60 * 2 });
        console.log("room created", room);
        return {
          ...room,
          error: null,
        };
      } catch {
        return {
          id: null,
          leader: null,
          members: [],
          error: "Failed to create room",
        };
      }
    }),
  join: publicProcedure
    .input(joinRoomSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const roomId = input.roomId;
        const room = await kv.get<Room>(`room-${roomId}`);

        if (!room) {
          return {
            error: "Room not found",
          };
        }

        return {
          ...room,
          error: null,
        };
      } catch {
        return {
          error: "Failed to join room",
        };
      }
    }),
});
