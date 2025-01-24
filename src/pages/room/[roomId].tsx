import { useRouter } from "next/router";
import { socket } from "../_app";
import Avatar from "boring-avatars";
import { useEffect, useRef, useState } from "react";
import TextField from "~/components/atomic/textField";
import Button from "~/components/atomic/button";
import { api } from "~/utils/api";
import classNames from "classnames";
import { TreeShaker } from "~/components/atomic/tree-shaker";
import { RoomProvider } from "~/components/room/RoomProvider";
import SetNameModal from "~/components/room/SetNameModal";
import RoomContent from "~/components/room/RoomContent";
import Messages from "~/components/room/Messages";
import PokerHand from "~/components/room/PokerHand";
import LeaderControls from "~/components/room/LeaderControls";
import NameDisplay from "~/components/room/NameDisplay";

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;

  const roomQuery = api.room.getRoom.useQuery(
    (roomId as string | undefined) ?? "",
  );

  const [name, setName] = useState<string>("");

  useEffect(() => {
    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
    });

    socket.on("joined-room", async ({ name }: { name: string }) => {
      await roomQuery.refetch();
    });

    if (!name) {
      const sessionName = sessionStorage.getItem("name");
      if (sessionName) {
        setName(sessionName);
      }
    }
    return () => {
      socket.off("vote");
    };
  }, []);

  if (!roomId) {
    return null;
  }

  if (roomQuery.data?.error) {
    return <div>{roomQuery.data.error}</div>;
  }

  return (
    <RoomProvider roomId={roomId as string}>
      <main className="flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-thd-brand to-neutral-50">
        <SetNameModal />
        <RoomContent />
        <NameDisplay />
        {name !== (roomQuery.data as any)?.leader && <PokerHand />}
        {name === (roomQuery.data as any)?.leader && <LeaderControls />}
        <Messages />
        <TreeShaker />
      </main>
    </RoomProvider>
  );
};

export default Room;
