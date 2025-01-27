import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "~/types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { kv } from "@vercel/kv";
import { Room, User } from "~/types/room.schema";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any as NetServer;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on(
        "join-room",
        async ({ roomId, user }: { roomId: string; user: User }) => {
          console.log("join-room", roomId, user, socket.id);

          await socket.join(roomId);

          await kv.set(socket.id, { roomId, ...user }, { ex: 60 * 60 * 2 });
          const room = await kv.get<Room>(`room-${roomId}`);

          let newRoom: Room;
          if (room !== null) {
            newRoom = room;
            const isLeader =
              room.leader.name === user.name && room.leader.id === user.id;

            if (!room.members.find((v) => v.id === user.id) && !isLeader) {
              newRoom = {
                ...room,
                members: [...room.members, { ...user, vote: null }],
              };
            }

            await kv.set<Room>(`room-${roomId}`, newRoom, { ex: 60 * 60 * 2 });
            io.to(roomId).emit("join-room");
            io.to(roomId).emit("message", {
              name: "System",
              message: `${user.name} has joined the room`,
            });
          }
        },
      );

      socket.on(
        "message",
        ({
          roomId,
          name,
          message,
        }: {
          roomId: string;
          name: string;
          message: string;
        }) => {
          console.log("message", roomId, name, message);
          io.to(roomId).emit("message", { name, message });
        },
      );

      socket.on(
        "vote",
        async ({
          roomId,
          name,
          vote,
        }: {
          roomId: string;
          name: string;
          vote: string;
        }) => {
          console.log("vote", roomId, name, vote);
          const value = await await kv.get<Room>(`room-${roomId}`);
          if (value === null) {
            return;
          }
          const room: Room = value;

          const memberIndex = room.members.findIndex(
            (v) => v.id === socket.id || v.name === name,
          );
          if (room.members[memberIndex]) {
            const currentVote = room.members[memberIndex].vote;
            room.members[memberIndex].vote =
              Number(vote) === currentVote ? null : Number(vote);
          }

          await kv.set(`room-${roomId}`, room, { ex: 60 * 60 * 2 });
          io.to(roomId).emit("vote", { name, vote });
        },
      );

      socket.on("get-room", async ({ roomId }: { roomId: string }) => {
        io.to(socket.id).emit("get-room", await kv.get<Room>(`room-${roomId}`));
      });

      socket.on("showvotes", async ({ roomId }: { roomId: string }) => {
        const room = await kv.get<Room>(`room-${roomId}`);
        if (room === null) {
          return;
        }
        await kv.set<Room>(`room-${roomId}`, { ...room, showingVotes: true });
        io.to(roomId).emit("showvotes");
      });

      socket.on("clearvotes", async ({ roomId }: { roomId: string }) => {
        const room = await kv.get<Room>(`room-${roomId}`);
        if (room === null) {
          return;
        }

        await kv.set<Room>(
          `room-${roomId}`,
          {
            ...room,
            showingVotes: false,
            members: room.members.map((member) => ({ ...member, vote: null })),
          },
          { ex: 60 * 60 * 2 },
        );
        io.to(roomId).emit("clearvotes");
      });

      socket.on("disconnect", async (reason) => {
        console.log("disconnect", reason);
        const { roomId, name } =
          (await kv.get<{ roomId: string; name: string }>(socket.id)) ?? {};

        if (roomId) {
          const room = await kv.get<Room>(`room-${roomId}`);

          if (room) {
            const newRoom: Room = {
              ...room,
              members: room.members.filter((v) => v.id !== socket.id),
            };
            await kv.set(`room-${roomId}`, newRoom, { ex: 60 * 60 * 2 });
          }
          io.to(roomId).emit("message", {
            name: "System",
            message: `${name} has left the room`,
          });
          io.to(roomId).emit("user-disconnect", {
            name: "System",
            message: `${name} has left the room`,
          });
        }
      });
    });
  }
  res.end();
};
