import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { createRoomSchema } from "~/types/createRoom";
import { joinRoomSchema } from "~/types/joinRoom";
import { randomString } from "~/utils/util";

export const roomRouter = createTRPCRouter({
  create: publicProcedure
    .input(createRoomSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const room = await ctx.db.room.create({
          data: {
            leader: input.name,
            id: randomString(8),
          },
        });

        return {
          ...room,
          error: null,
        };
      } catch {
        return {
          error: "Failed to create room",
        };
      }
    }),
  join: publicProcedure
    .input(joinRoomSchema)
    .mutation(async ({ input, ctx }) => {

      try {
        const room = await ctx.db.room.findUnique({
          where: {
            id: input.room,
          },
        });

        if (!room) {
          return {
            error: "Room not found",
          };
        }

        if (room.leader === input.name || room.members.includes(input.name)) {
          return {
            error: "This name is already in use in this room",
          };
        }

        const newRoom = await ctx.db.room.update({
          where: {
            id: input.room,
          },
          data: {
            members: {
              push: input.name,
            },
          }});

        return {
          ...newRoom,
          error: null
        };
      } catch {
        return {
          error: "Failed to join room",
        };
      }
    }),
  getRoom: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (!input) {
        return {
          error: "You must enter a room ID",
        };
      }

      try {
        const room = await ctx.db.room.findUnique({
          where: {
            id: input,
          },
        });

        return {
          ...room,
          error: null,
        };
      } catch {
        return {
          error: "Failed to get room",
        };
      }
    })
});
