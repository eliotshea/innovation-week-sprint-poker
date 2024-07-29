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
  const [messages, setMessages] = useState<{ name: string; message: string }[]>(
    [],
  );
  const [votes, setVotes] = useState< Record<string, string> >(
    {},
  );
  const [message, setMessage] = useState<string>("");
  const [showVotes, setShowVotes] = useState<boolean>(false);
  const [clearVotes, setClearVotes] = useState<boolean>(false);
  const [pointed, setPointed] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const pointsArray = ["0", "0.5", "1", "2", "3", "5", "8", "13", "21"];

  console.log(votes, 'votes');

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

    socket.on(
      "vote",
      ({ name, vote }: { name: string; vote: string }) => {
        //console.log("vote", name, vote);
        setVotes({...votes, [name]: vote});
      },
    );

    socket.on(
      "showvotes",
      ({ roomId, showvotes }: { roomId: string, showvotes: boolean }) => {
        //console.log("showVotes", showvotes);
        setShowVotes(showvotes);
      },
    );

    socket.on(
      "clearvotes",
      ({ roomId, clearvotes, currentvotes }: { roomId: string, clearvotes: boolean, currentvotes: Record<string, string> }) => {
        //console.log("clearvotes", name, clearvotes);
        setClearVotes(clearvotes);
        console.log(clearvotes, 'clearvotes');
        console.log(currentvotes, 'mainvotes')
       
          const updatedRecord : Record<string, string> = {};
              //console.log(votes, 'votesinsocket')
              for (const key in currentvotes) {
                if (currentvotes.hasOwnProperty(key)) {
                    updatedRecord[key] = "";
                }
            }
              setVotes(updatedRecord);
              setPointed(false);
              console.log(updatedRecord, 'votesinsocket')
        }
    );

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
      socket.off("clearvotes")
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

  const handlePointClick = (index: number) => {
    const vote = pointsArray[index];
    setPointed(true);
    socket.emit("vote", { roomId, name, vote });
  };

  const handleShowVotesClick = () => {
    socket.emit('showvotes', {roomId, showvotes: true})
  };

  const handleClearVotesClick = () => {
    socket.emit('clearvotes', {roomId, clearvotes: true, currentvotes: votes})
  }

  


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-thd-brand to-neutral-50">
      <div className="flex h-3/4 w-1/2 flex-col items-center justify-center rounded-xl bg-neutral-50 p-8 shadow-lg">
        <div className="w-full text-left">
          <h1 className="text-5xl">
            {(roomQuery.data as any)?.leader}&apos;s room
          </h1>
          <p className="text-xl">ID: {roomId}</p>
        </div>
        <div className="mt-8 flex w-full flex-row gap-8">
          <div className="border-r-2 pr-8 text-center">
            <Avatar
              name={roomQuery.data?.leader ?? "LEADER"}
              variant="beam"
              size={128}
            />
            <h3 className="mt-1 font-semibold">{roomQuery.data?.leader}</h3>
          </div>
          <div className="flex grow flex-row justify-center gap-8">
            {roomQuery.data?.members.map((member: string, index: number) => (
              <div key={index} className="text-center">
                <Avatar name={member} variant="beam" size={128} />
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
                    className={classNames(
                      "card-front h-full w-full bg-thd-brand",
                    )}
                  ></div>
                  <div className="card-back h-full w-full border-2 border-thd-brand">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-thd-brand">
                      ?
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 flex h-96 w-96 flex-col rounded-xl bg-neutral-50 shadow-lg">
        <div
          className="scrollbar-none flex grow flex-col gap-1 overflow-y-scroll px-2 pt-4"
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

      <div className="mt-4 text-white">Logged in as: {name}</div>
      {name !== (roomQuery.data as any)?.leader && (
        <div className="mt-8 flex h-64 w-64 pt-8">
          {pointsArray.map((point, index) => (
            <div
              key={point}
              className={classNames(
                "poker-card absolute left-1/2 h-48 w-36 rounded-md bg-neutral-50 shadow-lg",
                "cursor-pointer border-8 border-thd-brand outline-thd-brand/75",
                "flex text-center align-middle text-7xl font-bold text-thd-brand",
                "transition ease-in-out",
                `rotate-card-${index + 1} origin-[center_600%] -translate-x-1/2`,
                "hover:z-50 hover:scale-[102%] hover:shadow-2xl hover:outline",
              )}
              onClick={() => {
                handlePointClick(index);
              }}
            >
              <div className="mx-auto my-auto">{point}</div>
            </div>
          ))}
        </div>

      )}
      {name === (roomQuery.data as any)?.leader && (
        <div className="flex flex-row gap-4 pt-8">
          <Button
            className="rounded-full px-10 py-3 font-semibold text-white transition"
            onClick={() => {
              setVotes([]);
              setShowVotes(false);
            }}
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
      {/* 
      <div className="pt-10">
        <div className="flex h-96 w-96 flex-col rounded-xl bg-neutral-50 shadow-lg">
        <div className="flex flex-row pl-6">
          {pointed ? <div className="pr-2.5 pt-2">&#9989;</div> : ""}
          {
        Object.entries(votes).map(([key,value]) => {
            return (
              <div className="flex flex-row" key={key}>
              {/* <div className="pt-2" key={key}> */}
                <div className="pt-2">{key}:</div>
                <div className="pl-6 pt-2">
                  <div
                    className={`${!showVotes ? "h-5 w-12 bg-slate-900" : ""}`}
                  >
                    {pointed ? value.toString() : ""}
                  </div>
                </div>
              {/* </div> */}
            </div>
            )
        })
    }
        </div>

      </div> */}
      <TreeShaker />
    </main>
  );
};

export default Room;
