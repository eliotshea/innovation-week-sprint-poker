import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import useUser from "~/hooks/useUser";
import useRoom from "~/hooks/useRoom";
import type { Room } from "~/types/room.schema";
import Link from "next/link";

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
      {room !== null && children}
      {room === null && (
        <div className="m-8 rounded-lg bg-white p-8">
          <h1 className="mb-2 text-xl font-bold">Room not found</h1>
          <div className="flex flex-col gap-2 text-sm font-light">
            <span>
              This could be because the room has timed out, or there is an error
              in the link.
            </span>
            <span>
              Please check the link or{" "}
              <Link href="/" className="font-normal underline">
                click here
              </Link>{" "}
              to create a new room.
            </span>
          </div>
        </div>
      )}
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
