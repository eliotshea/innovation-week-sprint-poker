import React, { useState } from "react";
import TextField from "../atomic/textField";
import Button from "../atomic/button";
import { useRoomContext } from "./RoomProvider";

interface SetNameModalProps {}

const SetNameModal: React.FC<SetNameModalProps> = () => {
  const { showEnterNameModal } = useRoomContext();
  const [nameField, setNameField] = useState<string>("");

  if (!showEnterNameModal) {
    return null;
  }

  return (
    <div className="fixed z-[99] flex h-screen w-screen touch-none items-center justify-center overflow-auto bg-neutral-800/50">
      <div className="flex flex-col gap-4 rounded-xl bg-neutral-50 p-4 shadow-lg md:p-8">
        <h1 className="mb-4 text-2xl">Welcome to the room!</h1>
        <h1 className="text-xl">Enter your name:</h1>
        <TextField
          id="name"
          placeholder="name"
          value={nameField}
          onChange={(e) => setNameField(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sessionStorage.setItem("name", nameField);
              window.location.reload();
            }
          }}
        />
        <Button
          onClick={() => {
            sessionStorage.setItem("name", nameField);
            window.location.reload();
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default SetNameModal;
