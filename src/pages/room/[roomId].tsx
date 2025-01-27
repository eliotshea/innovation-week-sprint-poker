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

  if (!roomId) {
    return null;
  }

  return (
    <RoomProvider roomId={roomId as string}>
      <main className="flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-linear-to-t from-thd-brand to-neutral-50">
        <SetNameModal />
        <RoomContent />
        <NameDisplay />
        <PokerHand />
        <LeaderControls />
        <Messages />
        <TreeShaker />
      </main>
    </RoomProvider>
  );
};

export default Room;
