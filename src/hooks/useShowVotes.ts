import { useEffect, useState } from "react";
import { socket } from "~/pages/_app";

const useShowVotes = () => {
  const [showVotes, setShowVotes] = useState(false);

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
