import classNames from "classnames";
import React, { useState } from "react";
import { useRoomContext } from "./RoomProvider";
import { socket } from "~/pages/_app";

const PokerHand: React.FC = () => {
  const [pointed, setPointed] = useState(false);
  const { name, room, roomId } = useRoomContext();
  const { votes } = room ?? { votes: [] };
  const pointsArray = ["0", "0.5", "1", "2", "3", "5", "8", "13", "21"];

  const handlePointClick = (index: number) => {
    const vote = pointsArray[index];
    setPointed(true);
    socket.emit("vote", { roomId, name, vote });
  };

  return (
    <div className="flex h-64 w-64 pt-8">
      {pointsArray.map((point, index) => {
        const nameIndex = votes.findIndex((vote) => vote.member === name);
        let currentVoteValue: number | null = null;
        if (nameIndex !== -1 && votes[nameIndex]) {
          currentVoteValue = votes[nameIndex].points;
        }

        return (
          <div
            key={`card-${point}`}
            className={classNames(
              "poker-card absolute left-1/2 h-36 w-24 rounded-md bg-neutral-50 shadow-lg md:h-48 md:w-36",
              "cursor-pointer border-8 border-thd-brand outline-thd-brand/75",
              "flex text-center align-middle text-5xl font-bold text-thd-brand md:text-7xl",
              "transition ease-in-out",
              `rotate-card-${index + 1} origin-[center_280%] -translate-x-1/2 md:origin-[center_600%]`,
              {
                "z-40 scale-[102%] shadow-2xl outline":
                  currentVoteValue === Number(point),
                "hover:z-50 hover:scale-[102%] hover:shadow-2xl hover:outline":
                  currentVoteValue === null,
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
        );
      })}
    </div>
  );
};

export default PokerHand;
