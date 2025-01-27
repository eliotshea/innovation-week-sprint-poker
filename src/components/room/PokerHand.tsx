import classNames from "classnames";
import React, { useState } from "react";
import { useRoomContext } from "./RoomProvider";
import { socket } from "~/pages/_app";

type Card = {
  points: number;
  selected: boolean;
};

const defaultCardsArray: Card[] = [
  { points: 0, selected: false },
  { points: 0.5, selected: false },
  { points: 1, selected: false },
  { points: 2, selected: false },
  { points: 3, selected: false },
  { points: 5, selected: false },
  { points: 8, selected: false },
  { points: 13, selected: false },
  { points: 21, selected: false },
];

const PokerHand: React.FC = () => {
  const { user, room, roomId } = useRoomContext();
  const { name, id } = user ?? { name: "", id: "" };
  const { members } = room ?? { members: [] };
  const userVote =
    members.find((member) => member.name === name && member.id === id)?.vote ??
    null;

  const cardsArray = defaultCardsArray.map((card) => {
    return {
      ...card,
      selected: card.points === userVote,
    };
  });

  const handlePointClick = (index: number) => {
    const vote = cardsArray[index]?.points;

    socket.emit("vote", { roomId, name, vote });
  };

  if (room?.leader.name === name) {
    return null;
  }

  return (
    <div className="flex h-64 w-64 pt-8">
      {cardsArray.map((card, index) => {
        if (card.selected) {
          console.log(card);
        }
        return (
          <div
            key={`card-${card.points}`}
            className={classNames(
              "poker-card absolute left-1/2 h-36 w-24 rounded-md bg-neutral-50 shadow-lg md:h-48 md:w-36",
              "border-thd-brand outline-thd-brand/75 cursor-pointer border-8",
              "text-thd-brand flex text-center align-middle text-5xl font-bold md:text-7xl",
              "transition ease-in-out",
              `rotate-card-${index + 1} origin-[center_280%] -translate-x-1/2 md:origin-[center_600%]`,
              {
                "z-40 scale-[102%] shadow-2xl outline": card.selected,
                "hover:z-50 hover:scale-[102%] hover:shadow-2xl hover:outline":
                  !card.selected,
              },
            )}
            onClick={() => {
              handlePointClick(index);
            }}
          >
            <div className="absolute -top-2 -left-1 text-lg md:hidden">
              {card.points}
            </div>
            <div className="absolute -right-1 -bottom-2 text-lg md:hidden">
              {card.points}
            </div>
            <div className="mx-auto my-auto">{card.points}</div>
          </div>
        );
      })}
    </div>
  );
};

export default PokerHand;
