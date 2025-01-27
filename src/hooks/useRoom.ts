import { useState, useEffect } from "react";
import { socket } from "~/pages/_app";
import { Room } from "~/types/room.schema";

const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<Room>();

  const getRoom = () => {
    socket.emit("get-room", { roomId });
  };

  const handleGetRoom = (value: Room) => {
    console.log(value);
    setRoom(value);
  };

  useEffect(() => {
    socket.on("get-room", handleGetRoom);
    socket.on("vote", getRoom);
    socket.on("clearvotes", getRoom);
    socket.on("showvotes", getRoom);
    socket.on("join-room", getRoom);

    getRoom();

    return () => {
      socket.off("get-room", handleGetRoom);
      socket.off("vote", getRoom);
      socket.off("clearvotes", getRoom);
      socket.off("join-room", getRoom);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("focus", getRoom);

    return () => {
      window.removeEventListener("focus", getRoom);
    };
  }, [roomId]);

  return { room, getRoom };
};

export default useRoom;
