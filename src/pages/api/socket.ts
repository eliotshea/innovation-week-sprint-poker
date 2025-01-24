import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "~/types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { db } from "~/server/db";
import { kv } from "@vercel/kv";
import { stringify } from "querystring";
import { Room } from "~/types/votes";

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
        async ({ roomId, name }: { roomId: string; name: string }) => {
          console.log("join-room", roomId, name);
          await socket.join(roomId);

          await kv.set(socket.id, { roomId, name }, { ex: 60 * 60 * 2 });
          try {
            const room = await db.room.findUnique({
              where: {
                id: roomId,
              },
            });

            if (
              room &&
              !(room.members.includes(name) || room.leader === name)
            ) {
              await db.room.update({
                where: {
                  id: roomId,
                },
                data: {
                  members: {
                    push: name,
                  },
                },
              });
            }

            io.to(roomId).emit("message", {
              name: "System",
              message: `${name} has joined the room`,
            });
            io.to(roomId).emit("joined-room", {
              name: "System",
              message: `${name} has joined the room`,
            });
          } catch {
            console.log("Room not found");
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
          const value = await kv.get<Room>(`${roomId}-votes`);

          let room: Room;
          if (value === null) {
            room = {
              roomId,
              votes: [],
            };
          } else {
            room = value;
          }
          const voteIndex = room.votes.findIndex((v) => v.member === name);
          if (voteIndex === -1) {
            room.votes.push({ member: name, points: Number(vote) });
          } else if (room.votes[voteIndex]) {
            room.votes[voteIndex].points = Number(vote);
          }

          await kv.set(`${roomId}-votes`, room, { ex: 60 * 60 * 2 });
          io.to(roomId).emit("vote", { name, vote });
        },
      );

      socket.on("getvotes", async ({ roomId }: { roomId: string }) => {
        console.log("getvotes AAAAAAAAAAAAAAAAAAAAA", roomId);
        const value = await kv.get<Room>(`${roomId}-votes`);
        if (value) {
          io.to(socket.id).emit("getvotes", value);
        } else {
          const room = {
            roomId,
            votes: [],
          };
          await kv.set<Room>(`${roomId}-votes`, room, { ex: 60 * 60 * 2 });
        }
      });

      socket.on("showvotes", ({ roomId }: { roomId: string }) => {
        io.to(roomId).emit("showvotes");
      });

      socket.on("clearvotes", async ({ roomId }: { roomId: string }) => {
        await kv.set<Room>(
          `${roomId}-votes`,
          { roomId, votes: [] },
          { ex: 60 * 60 * 2 },
        );
        io.to(roomId).emit("clearvotes");
      });

      socket.on("disconnect", async (reason) => {
        console.log("disconnect", reason);
        const { roomId, name } =
          (await kv.get<{ roomId: string; name: string }>(socket.id)) ?? {};

        if (roomId) {
          const room = await db.room.findUnique({
            where: {
              id: roomId,
            },
          });
          if (room) {
            await db.room.update({
              where: {
                id: roomId,
              },
              data: {
                members: {
                  set: room.members.filter((member) => member !== name),
                },
              },
            });
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
