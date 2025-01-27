import React from "react";
import { useRoomContext } from "./RoomProvider";

const NameDisplay: React.FC = () => {
  const { user } = useRoomContext();

  if (!user) {
    return null;
  }

  return <div className="text-white">Logged in as: {user.name}</div>;
};

export default NameDisplay;
