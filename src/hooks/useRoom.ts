import { useState, useEffect } from "react";
import { socket } from "~/pages/_app";
import { Room } from "~/types/votes";

const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<Room>();

  const getRoom = () => {
    socket.emit("getvotes", { roomId });
  };

  const handleGetVotes = (value: Room) => {
    setRoom(value);
  };

  useEffect(() => {
    socket.on("getvotes", handleGetVotes);
    socket.on("vote", getRoom);
    socket.on("clearvotes", getRoom);

    return () => {
      socket.off("getvotes", handleGetVotes);
      socket.off("vote", getRoom);
      socket.off("clearvotes", getRoom);
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
