import React, { useState, useEffect, ChangeEvent } from "react";
import CreateRoomImage from '@/assets/work.jpg'
import Image from "next/image";
import { generateCode } from "@/utils/CodeGenerator";
import { Socket } from "socket.io-client";
import { useSocket } from '@/context/SocketContext';
import { useUser } from '@/context/UserContext';
import { useRouter } from "next/router";


const Index: React.FC = () => {

  const router = useRouter();
  const { socket } = useSocket();
  const { user, setUser } = useUser();

  const [name, setName] = useState("");
  const [roomID, setRoomID] = useState("");

  const handleName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleCode = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomID(e.target.value);
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const roomData = {
      name,
      roomID,
      userID: generateCode(),
      host: true,
      presenter: true,
    };
    setUser(roomData);
    localStorage.setItem('user', JSON.stringify(roomData));
    localStorage.setItem('roomID', roomID);
    router.push(`/room/${roomID}`);
    socket.emit("userJoined", roomData);

  };


  return (
    <form className="flex flex-col justify-center items-center gap-10 p-10 w-[50%]">
      <p className="cool-text text-5xl font-bold tracking-wide">
        Join Room
      </p>
      {/* <Image src={CreateRoomImage} width={400} alt="CreateRoom"  /> */}
      <div className="flex flex-col justify-center items-center gap-3 w-full">
        <input
          type="text"
          className="p-3 w-full text-[#2c2c2c] rounded-lg outline-indigo-500"
          style={{ border: "2px solid #ccc" }}
          value={name}
          name="name"
          onChange={handleName}
          placeholder="Enter your name"
        />
          <input
            type="text"
            className="p-3 w-full text-[#2c2c2c] rounded-lg outline-indigo-500 bg-slate-200"
            value={roomID}
            name="code"
            onChange={handleCode}
            placeholder="Enter room code"
          />
          
      </div>
      <div className={`button`}><div className="button-layer"></div>
      <button
        type="submit"
        onClick={handleSubmit}
        className={`-2 h-12 w-full  text-white font-semibold rounded-lg`}
        // style={{background:"radial-gradient( circle farthest-corner at 22.4% 21.7%, rgba(4,189,228,1) 0%, rgba(2,83,185,1) 100.2% )"}}
      >
        Join Room
      </button>
        </div>
    </form>
  );
}

export default Index;
