import React from "react";
import Button from "../atomic/button";
import { socket } from "~/pages/_app";
import { useRoomContext } from "./RoomProvider";

const LeaderControls: React.FC = () => {
  const { roomId, room, user } = useRoomContext();
  const { name, id } = user ?? { name: "", id: "" };

  const handleShowVotesClick = () => {
    socket.emit("showvotes", { roomId, showvotes: true });
  };

  const handleClearVotesClick = () => {
    socket.emit("clearvotes", {
      roomId,
    });
  };

  if (room?.leader.id !== id || room?.leader.name !== name) {
    return null;
  }

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
