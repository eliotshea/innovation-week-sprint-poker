import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import useUser from "~/hooks/useUser";
import useRoom from "~/hooks/useRoom";
import type { Room } from "~/types/room.schema";

interface RoomContextType {
  roomId: string;
  user: { id: string; name: string } | undefined;
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
  const user = useUser(roomId);
  const { room, getRoom } = useRoom(roomId);
  const showVotes = room?.showingVotes ?? false;
  const showEnterNameModal = !user;

  return (
    <RoomContext.Provider
      value={{ roomId, user, showEnterNameModal, room, getRoom, showVotes }}
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
