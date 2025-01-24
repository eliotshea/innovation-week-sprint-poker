import Avatar from "boring-avatars";
import classNames from "classnames";
import React from "react";
import { api } from "~/utils/api";
import { useRoomContext } from "./RoomProvider";

const RoomContent: React.FC = () => {
  const { roomId, room, showVotes } = useRoomContext();
  const roomQuery = api.room.getRoom.useQuery(
    (roomId as string | undefined) ?? "",
  );

  const { votes } = room ?? { votes: [] };

  return (
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
        {roomQuery.data?.members.length === 0 && (
          <button
            className="group my-12 flex cursor-pointer flex-row align-middle text-gray-500 active:border-gray-700 active:text-gray-700"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
            }}
          >
            <p>Invite your team!</p>
            <div className="relative ml-2 mt-1 h-8 w-6">
              <div className="absolute h-4 w-3 rounded-sm border-2 border-gray-300 group-active:border-gray-400"></div>
              <div className="absolute -top-1 left-1 h-4 w-3 rounded-sm border-2 border-gray-300 group-active:border-gray-400"></div>
            </div>
          </button>
        )}
        {roomQuery.data?.members.length !== 0 &&
          roomQuery.data?.members.map((member: string, index: number) => {
            const memberVote = votes.find((vote) => vote.member === member);

            return (
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
                    className={classNames(
                      "card-front h-full w-full shadow-md",
                      {
                        "bg-thd-brand": memberVote,
                        "bg-neutral-300": !memberVote,
                      },
                    )}
                  ></div>
                  <div className="card-back h-full w-full border-2 border-thd-brand">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-thd-brand">
                      {memberVote?.points ?? "🤔"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RoomContent;
