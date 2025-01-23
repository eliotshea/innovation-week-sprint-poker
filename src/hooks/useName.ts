import { useState, useEffect } from "react";
import { socket } from "../pages/_app";

const useName = (roomId: string) => {
  const [name, setName] = useState<string>();

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  useEffect(() => {
    if (name && roomId) {
      socket.emit("join-room", { roomId, name });
    }
  }, [name, roomId]);

  return name;
};

export default useName;
