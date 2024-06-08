"use client";
import React, { useRef, useState,useEffect,  RefObject, createRef } from "react";
import Whiteboard from "@/components/Whiteboard/index";
import { useRouter } from "next/router";
import { useSocket } from '@/context/SocketContext';
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from '@/context/UserContext';

// import your icons
import {
  faRotateRight,
  faRotateLeft,
  faPen,
  faSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faSquareFull, faCircle } from "@fortawesome/free-regular-svg-icons";

library.add(
  faRotateRight,
  faRotateLeft,
  faPen,
  faSlash,
  faSquareFull,
  faCircle
);

// export async function getServerSideProps(context:any) {
//   console.log("context:",context);
  
//   const { roomID } = context.params;
//   const { user } = context.query;

//   return {
//     props: {
//       roomID,
//       user: JSON.parse(user), // Parse the user string back to an object 
//     },
//   };
// }



const RoomPage = () => {
  const router = useRouter();
  const { socket } = useSocket();
  const { user, setUser } = useUser();
  
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  //   // console.log(user);
  // }, []);
 
  
  // console.log(router.query.roomID);

  type CanvasRefType = RefObject<HTMLCanvasElement>;
  type ContextRefType = RefObject<CanvasRenderingContext2D>;

  // Create refs with the defined types
  const canvasRef: CanvasRefType = useRef(null); //! useRef immutable
  const contextRef: ContextRefType = createRef(); //! createRef mutable and doesn't give ref.current is read-only error

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#ff0000");
  const [thickness, setThickness] = useState("5");
  const [elements, setElements] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const savedElements = localStorage.getItem('canvasElements');
      return savedElements ? JSON.parse(savedElements) : [];
    }
    return [];
  });
  const [history, setHistory] = useState<any>([]);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setElements([]);
  };

  
  useEffect(() => {
    localStorage.setItem("canvasElements", JSON.stringify(elements));
  }, [elements]);

  const undo = () => {
    if (elements.length === 1) {
      setHistory((prev: any) => [...prev, elements[elements.length - 1]]);
      handleClearCanvas();
    } else {
      setElements((prev: any) => prev.slice(0, -1));
      setHistory((prev: any) => [...prev, elements[elements.length - 1]]);
    }
  };
  const redo = () => {
    setElements((prevElements: any) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory: any) =>
      prevHistory.slice(0, prevHistory.length - 1)
    );
  };

  return (
    <div>
      {/* <h1>Room No: {router.query.roomID}</h1> */}
      <div className="h-[100vh] flex gap-20 justify-center items-end relative">
        <div className="p-5 absolute left-10 top-0 bg-white shadow-xl flex justify-center items-center w-80  rounded-lg my-5">
          <div className="text-2xl text-center font-semibold">
            Whiteboard Sharing App{" "}
            <div className="text-blue-500">Users Online: 0</div>
          </div>
        </div>

        <div className=" bg-[#f8f4f4] shadow-xl flex justify-center items-center mx-auto overflow-hidden">
          <Whiteboard
            canvasRef={canvasRef}
            contextRef={contextRef}
            elements={elements}
            setElements={setElements}
            tool={tool}
            color={color}
            thickness={thickness}
            socket={socket}
          />
        </div>
 
       
        <div className="flex absolute text-[#1a1b1e] bottom-5 justify-center items-center gap-5 p-5  h-12 bg-white shadow-xl rounded-lg my-5 ">
          {/* Pencil draw */}
          <div
            className={`flex tooltip relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
              tool === "pencil" ? "bg-[#d9dffc] text-blue-500" : ""
            }`}
            onClick={() => setTool(tool === "pencil" ? "" : "pencil")}
            >
            <span className="tooltiptext">Pen</span>
            <FontAwesomeIcon icon={faPen} size="lg" />
          </div>
          {/* Line */}
          <div
            className={`flex tooltip relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
              tool === "line" ? "bg-[#d9dffc] text-blue-500" : ""
            }`}
            onClick={() => setTool(tool === "line" ? "" : "line")}
          >
            <span className="tooltiptext">Line</span>
            <FontAwesomeIcon icon={faSlash} rotation={270} size="lg" />
          </div>
          {/* Rectangle Shape */}
          <div
            className={`flex tooltip relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
              tool === "rect" ? "bg-[#d9dffc] text-blue-500" : ""
            }`}
            onClick={() => setTool(tool === "rect" ? "" : "rect")}
          >
            <span className="tooltiptext">Rectangle</span>
            <FontAwesomeIcon icon={faSquareFull} size="lg" />
          </div>
          {/* Circle Shape */}
          <div
            className={`flex tooltip relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
              tool === "circle" ? "bg-[#d9dffc] text-blue-500" : ""
            }`}
            onClick={() => setTool(tool === "circle" ? "" : "circle")}
          >
            <span className="tooltiptext">Circle</span>
            <FontAwesomeIcon icon={faCircle} size="lg" />
          </div>
          {/* Color Input*/}
          <div className="flex tooltip relative justify-center items-center gap-2 cursor-pointer">
            <span className="tooltiptext">Color</span>
            <input
              type="color"
              name="tool"
              id="style1"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="cursor-pointer "
            />
          </div>
          {/* Thickness slider */}
          <div className="flex tooltip relative justify-center items-center gap-2 cursor-pointer">
              <span className="tooltiptext">Thickness</span>
            <input
              type="range"
              value={thickness}
              min={1}
              max={50}
              onChange={(e) => setThickness(e.target.value)}
              className="cursor-pointer"
              style={{
                /* Slider Track */
                background: "linear-gradient(to right, #007BFF, #007BFF)",
                /* Slider Thumb */
                border: "2px solid #007BFF",
              }}
            />
          </div>
        </div>
        <div className="p-1 absolute left-14 bottom-5 bg-white shadow-xl flex justify-center items-center h-12 w-36 rounded-lg gap-2 my-5">
          <div className="tooltip relative">
            <span className="tooltiptext">Undo</span>
            <button
              onClick={undo}
              disabled={elements.length === 0}
              className={`rounded-md text-[#1a1b1e] h-10 w-14 flex justify-center items-center p-4
          ${
            elements.length === 0
              ? "opacity-40 pointer-events-none"
              : "hover:bg-[#d9dffc] hover:text-blue-500"
          }
          `}
            >
              <FontAwesomeIcon icon={faRotateLeft} size="lg" />
            </button>
          </div>

          <hr className=" h-8" style={{ borderLeft: "2px solid #ccc" }} />
          <div className="tooltip relative">
            <span className="tooltiptext">Redo</span>
            <button
              onClick={redo}
              disabled={history.length < 1}
              className={`rounded-md text-[#1a1b1e]  h-10 w-14 flex justify-center items-center p-4
             ${
               history.length < 1
                 ? "opacity-40 pointer-events-none"
                 : "hover:bg-[#d9dffc] hover:text-blue-500"
             }
           `}
           >
              <FontAwesomeIcon icon={faRotateRight} size="lg" />
            </button>
          </div>
        </div>
        <button
        onClick={handleClearCanvas}
        className="absolute right-14 bottom-5 shadow-xl p-2 px-3 h-12 w-36  bg-red-600 hover:bg-red-700 text-white  font-semibold rounded-lg my-5"
        >
          Clear Canvas
        </button>

      </div>
    </div>
  );
};

export default RoomPage;
