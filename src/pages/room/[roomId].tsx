// Import dependencies
import { useRouter } from "next/router";
import { socket } from "../_app";
import Avatar from "boring-avatars";
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

    socket.on(
      "message",
      ({ name, message }: { name: string; message: string }) => {
        console.log("message", name, message);
        setMessages((prev) => [...prev, { name, message }]);
      },
    );

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

  if (roomQuery.data?.error) {
    return <div>{roomQuery.data.error}</div>;
  }

  console.log(roomQuery.data);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-thd-brand to-neutral-50">
      <div>
        <h1 className="text-5xl text-white">
          {(roomQuery.data as any)?.leader}&apos;s room
        </h1>
        <p className="text-xl text-white">ID: {roomId}</p>
      </div>
      <div className="flex h-96 w-96 flex-col rounded-xl bg-neutral-50 shadow-lg">
        <div className="flex grow flex-col gap-1 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className="flex flex-row gap-2 rounded-md bg-neutral-100"
            >
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
      <div className="mt-8 flex flex-row gap-8 rounded-xl bg-neutral-50 p-12 shadow-lg">
        <div className="border-r-2 pr-8 text-center">
          <Avatar name={roomQuery.data?.leader} variant="beam" size={128} />
          <h3>{roomQuery.data?.leader}</h3>
        </div>
        <div className="flex flex-row gap-8">
          {roomQuery.data?.members.map((member: string, index: number) => (
            <div key={index} className="text-center">
              <Avatar name={member} variant="beam" size={128} />
              <h3>{member}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-white">Logged in as: {name}</div>
    </main>
  );
};

export default Room;
