import { NextApiRequest,  } from "next";
import { NextApiResponseServerIO } from "~/types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { db } from "~/server/db";
import { kv } from "@vercel/kv";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer: NetServer = (res.socket.server as any) as NetServer;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join-room", async ({ roomId, name }: {roomId: string, name: string} ) => {
        console.log("join-room", roomId, name);
        await socket.join(roomId);
        await kv.set(socket.id, { roomId, name }, { ex: 60 * 60 * 2});
        try {
          const room = await db.room.findUnique({
            where: {
              id: roomId,
            }
          });

          if (room && (!(room.members.includes(name) || room.leader === name))) {
            await db.room.update({
              where: {
                id: roomId,
              },
              data: {
                members: {
                  push: name,
                }
              }
            })
          }

          io.to(roomId).emit("message", { name: "System", message: `${name} has joined the room` });
          io.to(roomId).emit("joined-room", { name: "System", message: `${name} has joined the room` });
        } catch {
          console.log("Room not found");
        }
      });

      socket.on("message", ({ roomId, name, message }: {roomId: string, name: string, message: string}) => {
        console.log("message", roomId, name, message);
        io.to(roomId).emit("message", { name, message });
      });

      socket.on("vote", ({ roomId, name, vote }: {roomId: string, name: string, vote: string}) => {
        console.log("vote", roomId, name, vote);
        io.to(roomId).emit("vote", { name, vote });
      });
      
      socket.on("disconnect", async (reason) => {
        console.log("disconnect", reason);
        const { roomId, name } = await kv.get<{roomId: string, name: string}>(socket.id) ?? {};
        
        if (roomId) {
          const room = await db.room.findUnique({
            where: {
              id: roomId,
            }
          });
          if (room) {
            await db.room.update({
              where: {
                id: roomId,
              },
              data: {
                members: {
                  set: room.members.filter((member) => member !== name),
                }
              }
            })
          }
          io.to(roomId).emit("message", { name: "System", message: `${name} has left the room` });
          io.to(roomId).emit("user-disconnect", { name: "System", message: `${name} has left the room` });
        }
      })
    })
  }
  res.end();
};