import { NextApiRequest,  } from "next";
import { NextApiResponseServerIO } from "~/types/next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { db } from "~/server/db";
import { socket } from "../_app";

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
        try {
          const room = await db.room.findUnique({
            where: {
              id: roomId,
            }
          });

          if (room && (!room.members.includes(name) || room.leader === name)) {
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
        } catch {
          console.log("Room not found");
        }
      });

      socket.on("message", ({ roomId, name, message }: {roomId: string, name: string, message: string}) => {
        console.log("message", roomId, name, message);
        io.to(roomId).emit("message", { name, message });
      });
      
    })
  }
  res.end();
};