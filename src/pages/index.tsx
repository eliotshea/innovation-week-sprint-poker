import TextField from "~/components/atomic/textField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { type CreateRoomInput, createRoomSchema } from "~/types/createRoom.schema";
import Button from "~/components/atomic/button";
import { useState } from "react";
import { type JoinRoomInput, joinRoomSchema } from "~/types/joinRoom.schema";
import HomeDepotLogo from "~/styles/homeDepotLogo";
import { useRouter } from "next/router";

export default function Home() {
  const createRoom = api.room.create.useMutation();
  const joinRoom = api.room.join.useMutation();
  const router = useRouter();

  const {
    register: registerCreateRoom,
    handleSubmit: handleSubmitCreateRoom,
    setError: setErrorCreateRoom,
    formState: { errors: createRoomErrors },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      id: crypto.randomUUID(),
    },
  });

  const {
    register: registerJoinRoom,
    handleSubmit: handleSubmitJoinRoom,
    setError: setErrorJoinRoom,
    formState: { errors: joinRoomErrors },
  } = useForm<JoinRoomInput>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      id: crypto.randomUUID(),
    },
  });

  const [showJoin, setShowJoin] = useState<boolean>(false);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-t from-thd-brand to-neutral-50">
        <div className="flex flex-col items-center gap-8 rounded-lg bg-neutral-50 p-12 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <HomeDepotLogo />
            <h1 className="text-2xl">Planning Poker</h1>
          </div>

          {!showJoin && (
            <>
              <TextField
                id="name"
                placeholder="Name"
                error={createRoomErrors.name?.message}
                {...registerCreateRoom("name")}
                className="mt-4"
              />
              <Button
                className="w-full"
                onClick={async () => {
                  console.log("create room");
                  await handleSubmitCreateRoom(
                    async (data) => {
                      const res = await createRoom.mutateAsync(data);
                      if (res.error) {
                        setErrorCreateRoom("name", {
                          message: res.error,
                        });
                      } else {
                        sessionStorage.setItem(
                          "user",
                          JSON.stringify({ name: data.name, id: data.id }),
                        );
                        await router.push(`/room/${(res as any).roomId}`);
                      }
                    },
                    (error) => {
                      console.log(error);
                      console.log("invalid form");
                    },
                  )();
                }}
              >
                Create room
              </Button>
              <h2 className="underline" onClick={() => setShowJoin(true)}>
                Join a room
              </h2>
            </>
          )}
          {showJoin && (
            <>
              <TextField
                id="name"
                placeholder="Name"
                error={joinRoomErrors.name?.message}
                {...registerJoinRoom("name")}
                className="mt-4"
              />
              <TextField
                id="roomId"
                placeholder="Room ID"
                error={joinRoomErrors.roomId?.message}
                {...registerJoinRoom("roomId")}
              />
              <Button
                className="w-full"
                onClick={async () => {
                  await handleSubmitJoinRoom(async (data) => {
                    const res = await joinRoom.mutateAsync(data);

                    if (res.error) {
                      setErrorJoinRoom("name", {
                        message: res.error,
                      });
                    } else {
                      sessionStorage.setItem(
                        "user",
                        JSON.stringify({ name: data.name, id: data.id }),
                      );

                      await router.push(`/room/${(res as any).roomId}`);
                    }
                  })();
                }}
              >
                Join room
              </Button>
              <h2 className="underline" onClick={() => setShowJoin(false)}>
                Create a room
              </h2>
            </>
          )}
        </div>
      </main>
    </>
  );
}
