// Import dependencies
import { useRouter } from "next/router";
import { socket } from "../_app";
import { useEffect, useState } from "react";
import TextField from "~/components/textField";
import Button from "~/components/button";
import { api } from "~/utils/api";

// Define the component
const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;

  const roomQuery = api.room.getRoom.useQuery(
    (roomId as string | undefined) ?? "",
  );

  const [name, setName] = useState<string>("");
  const [messages, setMessages] = useState<{ name: string; message: string }[]>(
    [],
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
    });

    socket.on("message", ({ name, message }) => {
      console.log("message", name, message);
      setMessages((prev) => [...prev, { name, message }]);
    });

    if (!name) {
      const sessionName = sessionStorage.getItem("name");
      if (sessionName) {
        setName(sessionName);
      }
    }
    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    if (name && roomId) {
      socket.emit("join-room", { roomId, name });
    }
  }, [name, roomId]);

  console.log(roomQuery.data);

  if (roomQuery.data?.error) {
    return <div>{roomQuery.data.error}</div>;
  }

  return (
    <main className="from-thd-brand flex min-h-screen flex-col items-center justify-center bg-gradient-to-t to-neutral-50">
      <div>
        <h1 className="text-5xl text-white">
          {(roomQuery.data as any)?.leader}'s room
        </h1>
        <p className="text-xl text-white">ID: {roomId}</p>
      </div>
      <div className="flex h-96 w-96 flex-col rounded-xl bg-neutral-50 shadow-lg">
        <div className="flex grow flex-col gap-1 p-4">
          {messages.map((message, index) => (
            <div className="flex flex-row gap-2 rounded-md bg-neutral-100">
              <p key={`name${index}`} className="text-thd-brand">
                {message.name}
              </p>
              <p key={`message${index}`}>{message.message}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-row p-2">
          <TextField
            id="message"
            placeholder="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mr-2 w-full"
          />
          <Button
            onClick={() => {
              socket.emit("message", { roomId, name, message });
              setMessage("");
            }}
          >
            Send
          </Button>
        </div>
      </div>
      <div className="mt-4 text-white">Logged in as: {name}</div>
    </main>
  );
};

export default Room;
