import React, { useState, useEffect, ChangeEvent } from "react";
import CreateRoomImage from "@/assets/2101862.jpg";
import Image from "next/image";
import { useSocket } from '@/context/SocketContext';
import { generateCode } from "@/utils/CodeGenerator";
import { useRouter } from "next/router";
import { useUser } from '@/context/UserContext';
import { useDispatch } from "react-redux";
import { showMessage } from "@/store/reducers/notificationSlice";

interface Props {
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
}
const Index: React.FC<Props> = ({ mode, setMode }) => {
  const router = useRouter();
  const { socket } = useSocket();
  const { user, setUser } = useUser();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [roomID, setRoomID] = useState("");

  const handleName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleClick = (e: any) => {
    e.preventDefault();
    let Code = generateCode();
    setRoomID(Code);
  };
  const handleCopy = (e: any) => {
    e.preventDefault();
    dispatch(showMessage({ message: `Text copied to clipboard`, messageType: 'success' }));
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomID).then(() => {
        console.log('Text copied to clipboard');
      }).catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }};
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
    // router.push(`/room/${roomID}`);
    
    router.push(
      {
        pathname: `/room/${roomID}`,
        // query: { user: JSON.stringify(user) },
      },
      // undefined,
      // { shallow: true }
    );
    socket.emit("userJoined", roomData);
  };


  return (
    <form className={`${mode==="create"?"flex":"hidden md:flex"} flex-col justify-center items-center gap-10  p-10 md:w-[50%]`}>
      <p className="cool-text text-5xl font-bold tracking-wide">Create Room</p>
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
        <div className="flex justify-center items-center gap-4">
          <input
            type="text"
            className="p-3 w-full text-[#2c2c2c] rounded-lg outline-indigo-500 bg-slate-200"
            value={roomID}
            disabled
            name="code"
            placeholder="Generate room code"
          />

          <button
            onClick={handleClick}
            style={{
              background:
                "radial-gradient( circle farthest-corner at 22.4% 21.7%, rgba(4,189,228,1) 0%, rgba(2,83,185,1) 100.2% )",
            }}
            className="p-2 px-3 h-12 w-28 text-white font-semibold rounded-lg"
          >
            Generate
          </button>

          <button
            onClick={handleCopy}
            className="p-2 px-3 h-12 w-28 text-red-600 border-red-600 hover:bg-red-600 hover:text-white border-2 font-semibold rounded-lg"
          >
            Copy
          </button>
        </div>
      </div>
      <div className={`button `}>
        <div className="button-layer"></div>
        <button
          type="submit"
          onClick={handleSubmit}
          className={`p-2 h-12 w-full  text-white font-semibold rounded-lg`}
          // style={{background:"radial-gradient( circle farthest-corner at 22.4% 21.7%, rgba(4,189,228,1) 0%, rgba(2,83,185,1) 100.2% )"}}
        >
          Generate Room
        </button>
      </div>
        <p onClick={()=>{setMode("join")}} className="block md:hidden underline text-blue-500 cursor-pointer">or join a room, if you've got a code</p>
    </form>
  );
};

export default Index;
