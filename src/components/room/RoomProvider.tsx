import React, { createContext, useContext, useState, ReactNode } from "react";
import { socket } from "../../pages/_app";
import useName from "~/hooks/useName";

interface RoomContextType {
  name: string | undefined;
  showEnterNameModal: boolean;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{
  children: ReactNode;
  roomId: string;
}> = ({ children, roomId }) => {
  const name = useName(roomId);
  const showEnterNameModal = !name;

  return (
    <RoomContext.Provider value={{ name, showEnterNameModal }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
