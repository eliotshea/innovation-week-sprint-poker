import React, { useEffect, useRef, useState } from "react";
import TextField from "../atomic/textField";
import Button from "../atomic/button";
import { socket } from "~/pages/_app";
import { useRoomContext } from "./RoomProvider";

interface MessagesProps {}

const Messages: React.FC<MessagesProps> = () => {
  const [messages, setMessages] = useState<{ name: string; message: string }[]>(
    [],
  );
  const [messageField, setMessageField] = useState<string>("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const { name, roomId } = useRoomContext();

  const handleMessage = ({
    name,
    message,
  }: {
    name: string;
    message: string;
  }) => {
    setMessages((prev) => [...prev, { name, message }]);
    setTimeout(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  useEffect(() => {
    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [roomId]);

  return (
    <div className="bottom-4 z-50 mb-4 flex h-64 flex-col rounded-xl bg-neutral-50 shadow-lg md:right-4 md:mb-0 md:h-64 md:w-96 lg:absolute">
      <div
        className="flex grow flex-col gap-1 overflow-y-scroll px-2 pt-4 scrollbar-none"
        ref={messagesRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className="flex flex-row gap-1 rounded-md bg-neutral-100 px-2 py-1"
          >
            <p key={`name${index}`} className="text-thd-brand">
              {message.name}:
            </p>
            <p key={`message${index}`}>{message.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-row p-2">
        <TextField
          id="message"
          placeholder="message"
          value={messageField}
          onChange={(e) => setMessageField(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              socket.emit("message", { roomId, name, message: messageField });
              setMessageField("");
            }
          }}
          className="mr-2 w-full"
        />
        <Button
          onClick={() => {
            socket.emit("message", { roomId, name, message: messageField });
            setMessageField("");
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Messages;
