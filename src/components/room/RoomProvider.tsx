import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { socket } from "../../pages/_app";
import useName from "~/hooks/useName";
import useRoom from "~/hooks/useRoom";
import { Room } from "~/types/votes";
import useShowVotes from "~/hooks/useShowVotes";

interface RoomContextType {
  roomId: string;
  name: string | undefined;
  showEnterNameModal: boolean;
  room: Room | undefined;
  getRoom: () => void;
  showVotes: boolean;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{
  children: ReactNode;
  roomId: string;
}> = ({ children, roomId }) => {
  const name = useName(roomId);
  const { room, getRoom } = useRoom(roomId);
  const { showVotes } = useShowVotes();
  const showEnterNameModal = !name;

  return (
    <RoomContext.Provider
      value={{ roomId, name, showEnterNameModal, room, getRoom, showVotes }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
