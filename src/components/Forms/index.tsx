import React, { useState } from "react";
import CreateRoom from "./CreateRoomForm/index";
import JoinRoom from "./JoinRoomForm/index";

const Index: React.FC = () => {
  const [mode, setMode] = useState("create");

  return (
    <div className="flex flex-col md:flex-row gap-20 justify-center items-center">
      <CreateRoom mode={mode} setMode={setMode}/>
      <div className="hidden md:block text-7xl text-[#ccc] kode-mono divider relative py-10">
        OR
      </div>
      <JoinRoom mode={mode} setMode={setMode}/>
    </div>
  );
};

export default Index;
