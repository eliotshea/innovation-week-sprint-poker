import React from "react";
import Button from "../atomic/button";
import { socket } from "~/pages/_app";
import { useRoomContext } from "./RoomProvider";

const LeaderControls: React.FC = () => {
  const { roomId } = useRoomContext();

  const handleShowVotesClick = () => {
    socket.emit("showvotes", { roomId, showvotes: true });
  };

  const handleClearVotesClick = () => {
    socket.emit("clearvotes", {
      roomId,
    });
  };

  return (
    <div className="mb-8 flex flex-row gap-4 pt-8">
      <Button
        className="rounded-full px-10 py-3 font-semibold text-white transition"
        onClick={handleClearVotesClick}
      >
        Clear Votes
      </Button>
      <Button
        className="rounded-full px-10 py-3 font-semibold text-white transition"
        onClick={handleShowVotesClick}
      >
        Show Votes
      </Button>
    </div>
  );
};

export default LeaderControls;
