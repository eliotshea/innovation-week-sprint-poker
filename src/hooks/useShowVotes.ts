import { useEffect, useState } from "react";
import { socket } from "~/pages/_app";
import { type Room } from "~/types/room.schema";

const useShowVotes = (room: Room | undefined) => {
  const [showVotes, setShowVotes] = useState(room?.showingVotes ?? false);

  useEffect(() => {
    socket.on("showvotes", () => {
      setShowVotes(true);
    });

    socket.on("clearvotes", () => {
      setShowVotes(false);
    });

    return () => {
      socket.off("showvotes");
      socket.off("clearvotes");
    };
  }, []);

  return {
    showVotes,
  };
};

export default useShowVotes;
