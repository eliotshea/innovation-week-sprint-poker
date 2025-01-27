import { useState, useEffect } from "react";
import { socket } from "../pages/_app";

type User = {
  id: string;
  name: string;
};

const useUser = (roomId: string) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (user && roomId) {
      socket.emit("join-room", { roomId, user });
    }
  }, [user, roomId]);

  return user;
};

export default useUser;
