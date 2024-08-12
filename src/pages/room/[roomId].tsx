// Import dependencies
import { useRouter } from "next/router";
import { socket } from "../_app";
import Avatar from "boring-avatars";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import TextField from "~/components/textField";
import Button from "~/components/button";
import { api } from "~/utils/api";
import classNames from "classnames";
import { TreeShaker } from "~/components/tree-shaker";

// Define the component
const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;

  const roomQuery = api.room.getRoom.useQuery(
    (roomId as string | undefined) ?? "",
  );

  const [name, setName] = useState<string>("");
  const [nameField, setNameField] = useState<string>("");
  const [messages, setMessages] = useState<{ name: string; message: string }[]>(
    [],
  );
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>("");
  const [showVotes, setShowVotes] = useState<boolean>(false);
  const [showEnterNameModal, setShowEnterNameModal] = useState<boolean>(false);
  const [pointed, setPointed] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const pointsArray = ["0", "0.5", "1", "2", "3", "5", "8", "13", "21"];

  console.log(votes, "votes");

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
        setTimeout(() => {
          messagesRef.current?.scrollTo({
            top: messagesRef.current?.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      },
    );

    socket.on("joined-room", async ({ name }: { name: string }) => {
      //console.log("joined-room", name);
      await roomQuery.refetch();
    });

    socket.on("vote", ({ name, vote }: { name: string; vote: string }) => {
      //console.log("vote", name, vote);
      setVotes((prev) => {
        return { ...prev, [name]: vote };
      });
    });

    socket.on("showvotes", () => {
      //console.log("showVotes", showvotes);
      setShowVotes(true);
    });

    socket.on("clearvotes", () => {
      setShowVotes(false);
      setTimeout(() => {
        setVotes({});
      }, 200);
    });

    if (!name) {
      const sessionName = sessionStorage.getItem("name");
      if (sessionName) {
        setName(sessionName);
      }
    }
    return () => {
      socket.off("message");
      socket.off("vote");
      socket.off("showvotes");
      socket.off("clearvotes");
    };
  }, []);

  useEffect(() => {
    if (name && roomId) {
      socket.emit("join-room", { roomId, name });
    }

    setShowEnterNameModal(!name);
  }, [name, roomId]);

  if (roomQuery.data?.error) {
    return <div>{roomQuery.data.error}</div>;
  }

  const handlePointClick = (index: number) => {
    const vote = pointsArray[index];
    setPointed(true);
    socket.emit("vote", { roomId, name, vote });
  };

  const handleShowVotesClick = () => {
    socket.emit("showvotes", { roomId, showvotes: true });
  };

  const handleClearVotesClick = () => {
    socket.emit("clearvotes", {
      roomId,
      clearvotes: true,
      currentvotes: votes,
    });
  };

  const testArray = [
    "Eliot 1",
    "Eliot 2",
    "Eliot 3",
    "Eliot 4",
    "Eliot 5",
    "Eliot 6",
    "Eliot 7",
    "Eliot 8",
    "Eliot 9",
    "Eliot 10",
    "Eliot 11",
    "Eliot 12",
    "Eliot 13",
    "Eliot 14",
    "Eliot 15",
    "Eliot 16",
    "Eliot 17",
    "Eliot 18",
    "Eliot 19",
    "Eliot 20",
  ];

  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-thd-brand to-neutral-50">
      {showEnterNameModal && (
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
      )}

      <div className="m-4 flex min-w-1/2 flex-col items-center justify-center rounded-xl bg-neutral-50 p-4 shadow-lg md:p-8">
        <div className="flex w-full flex-row justify-start border-b-2 pb-4 text-left">
          <div className="mr-4 block md:hidden">
            <Avatar
              name={(roomQuery.data as any)?.leader}
              variant="beam"
              size={64}
            />
          </div>

          <div className="mr-4 hidden md:block">
            <Avatar
              name={(roomQuery.data as any)?.leader}
              variant="beam"
              size={128}
            />
          </div>
          <div className="my-auto w-full">
            <h1 className="text-2xl md:text-5xl">
              {(roomQuery.data as any)?.leader}&apos;s room
            </h1>
            <p className="select-text text-xl">ID: {roomId}</p>
          </div>
        </div>
        <div className="mt-8 flex grow flex-row flex-wrap justify-center gap-4 overflow-y-auto md:max-h-[600px] md:gap-8">
          {roomQuery.data?.members.map((member: string, index: number) => (
            <div key={index} className="text-center">
              <div className="hidden md:block">
                <Avatar name={member} variant="beam" size={128} />
              </div>
              <div className="block md:hidden">
                <Avatar name={member} variant="beam" size={64} />
              </div>
              <h3 className="mt-1 font-semibold">{member}</h3>
              <div
                className={classNames(
                  "vote-card relative mx-auto mt-4 h-16 w-12 rounded-md shadow-inner transition duration-700 ease-in-out",
                  {
                    flip: showVotes,
                  },
                )}
              >
                <div
                  className={classNames("card-front h-full w-full shadow-md", {
                    "bg-thd-brand": votes[member],
                    "bg-neutral-300": !votes[member],
                  })}
                ></div>
                <div className="card-back h-full w-full border-2 border-thd-brand">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-thd-brand">
                    {votes[member] ?? "🤔"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-white">Logged in as: {name}</div>
      {name !== (roomQuery.data as any)?.leader && (
        <div className="flex h-64 w-64 pt-8">
          {pointsArray.map((point, index) => (
            <div
              key={point}
              className={classNames(
                "poker-card absolute left-1/2 h-36 w-24 rounded-md bg-neutral-50 shadow-lg md:h-48 md:w-36",
                "cursor-pointer border-8 border-thd-brand outline-thd-brand/75",
                "flex text-center align-middle text-5xl font-bold text-thd-brand md:text-7xl",
                "transition ease-in-out",
                `rotate-card-${index + 1} origin-[center_280%] -translate-x-1/2 md:origin-[center_600%]`,
                {
                  "z-40 scale-[102%] shadow-2xl outline": votes[name] === point,
                  "hover:z-50 hover:scale-[102%] hover:shadow-2xl hover:outline":
                    !votes[name],
                },
              )}
              onClick={() => {
                handlePointClick(index);
              }}
            >
              <div className="absolute -left-1 -top-2 text-lg md:hidden">
                {point}
              </div>
              <div className="absolute -bottom-2 -right-1 text-lg md:hidden">
                {point}
              </div>
              <div className="mx-auto my-auto">{point}</div>
            </div>
          ))}
        </div>
      )}
      {name === (roomQuery.data as any)?.leader && (
        <div className="mb-8 flex flex-row gap-4 pt-8">
          <Button
            className="rounded-full px-10 py-3 font-semibold text-white transition"
            onClick={handleClearVotesClick}
          >
            Clear Votes
          </Button>
          <Button
            className="rounded-full px-10 py-3 font-semibold text-white transition"
            onClick={handleShowVotesClick}
          >
            Show Votes
          </Button>
        </div>
      )}

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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                socket.emit("message", { roomId, name, message });
                setMessage("");
              }
            }}
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
      <TreeShaker />
    </main>
  );
};

export default Room;
