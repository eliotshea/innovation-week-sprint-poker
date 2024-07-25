import React, { useEffect, useState } from "react";
import { socket } from "~/pages/_app";

const Test: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    console.log(socket);
  }, []);

  return (
    <div>
      <h1>{connected}</h1>
      <h1>awtasdflkjhawerflkjh</h1>
      <h1>{connected ? "CONNECTED" : "NOT"}</h1>
    </div>
  );
};

export default Test;
