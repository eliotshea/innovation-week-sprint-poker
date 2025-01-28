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
      <SetNameModal />
      <RoomContent />
      <NameDisplay />
      <PokerHand />
      <LeaderControls />
      <Messages />
      <TreeShaker />
    </RoomProvider>
  );
};

export default Room;
