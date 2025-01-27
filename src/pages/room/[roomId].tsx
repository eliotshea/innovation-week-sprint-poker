import { useRouter } from "next/router";
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
      <main className="from-thd-brand flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-linear-to-t to-neutral-50">
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
