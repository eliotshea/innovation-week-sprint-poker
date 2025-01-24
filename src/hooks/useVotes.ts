import { get } from "http";
import { useState, useEffect } from "react";
import { socket } from "~/pages/_app";
import { Room } from "~/types/votes";

const useRoomVotes = (roomId: string) => {
  const [room, setRoom] = useState<Room>();

  const getRoom = () => {
    socket.emit("getvotes", { roomId });
  };

  useEffect(() => {
    socket.on("getvotes", (value: Room) => {
      setRoom(value);
    });

    return () => {
      socket.off("getvotes");
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

export default useRoomVotes;
