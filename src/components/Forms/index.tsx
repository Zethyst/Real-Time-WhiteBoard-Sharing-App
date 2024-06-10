import React from "react";
import CreateRoom from "./CreateRoomForm/index";
import JoinRoom from "./JoinRoomForm/index";


const Index: React.FC = () => {

  return (
    <div className="flex gap-20 justify-center items-center">
      <CreateRoom />
      <div className="text-7xl text-[#ccc] kode-mono divider relative py-10">
        OR
      </div>
      <JoinRoom />
    </div>
  );
};

export default Index;
