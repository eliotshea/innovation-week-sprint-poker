import React from "react";
import { useRoomContext } from "./RoomProvider";

const NameDisplay: React.FC = () => {
  const { name } = useRoomContext();

  return <div className="text-white">Logged in as: {name}</div>;
};

export default NameDisplay;
