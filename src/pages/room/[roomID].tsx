"use client";
import React, {
  useRef,
  useState,
  useEffect,
  RefObject,
  createRef,
} from "react";
import Whiteboard from "@/components/Whiteboard/index";
import { useRouter } from "next/router";
import { useSocket } from "@/context/SocketContext";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "@/context/UserContext";
import { useDispatch } from "react-redux";
import { showMessage } from "@/store/reducers/notificationSlice";
import SendIcon from "@mui/icons-material/Send";

// import your icons
import {
  faRotateRight,
  faRotateLeft,
  faPen,
  faSlash,
  faXmark,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { faSquareFull, faCircle } from "@fortawesome/free-regular-svg-icons";
import Sidebar from "@/components/Sidebar/Sidebar";

library.add(
  faRotateRight,
  faRotateLeft,
  faPen,
  faSlash,
  faSquareFull,
  faCircle,
  faXmark,
  faMessage
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
  const dispatch = useDispatch();
  const { user, setUser, totalUsers, setTotalUsers } = useUser();

  // console.log(router.query.roomID);

  type CanvasRefType = RefObject<HTMLCanvasElement>;
  type ContextRefType = RefObject<CanvasRenderingContext2D>;

  // Create refs with the defined types
  const canvasRef: CanvasRefType = useRef(null); //! useRef immutable
  const contextRef: ContextRefType = createRef(); //! createRef mutable and doesn't give ref.current is read-only error
  const messagesEndRef = useRef<HTMLDivElement>(null);

  interface chat {
    message: string;
    user: string;
    time: string;
  }

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#ff0000");
  const [openSideBar, setOpenSideBar] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [penMode, setPenMode] = useState<boolean>(false);
  const [badge, setBadge] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [chats, setChats] = useState<chat[]>([]);
  const [thickness, setThickness] = useState("5");
  const [newMessages, setNewMessages] = useState(0);
  const [elements, setElements] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const savedElements = localStorage.getItem("canvasElements");
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
    const storedUsers = localStorage.getItem("totalUsers");
    if (storedUsers) {
      setTotalUsers(JSON.parse(storedUsers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("canvasElements", JSON.stringify(elements));
  }, [elements]);

  useEffect(() => {
    // Function to update state based on screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    socket.on("MessageResponse", (data) => {
      setBadge(true);
      setNewMessages((prev) => prev + 1);
      setChats((prevChats) => {
        // Check if the incoming message is different from the last message
        const lastMessage = prevChats[prevChats.length - 1];
        if (
          !lastMessage ||
          lastMessage.message !== data.message ||
          lastMessage.time !== data.time
        ) {
          return [...prevChats, data];
        }
        return prevChats;
      });
    });

    // // Cleanup on unmount
    // return () => {
    //   socket.off("MessageResponse");
    // };
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit" as const,
      month: "2-digit" as const,
      year: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
      hour12: true,
    };
    return date.toLocaleString("en-GB", options); // 'en-GB' for dd/mm/yyyy format
  };

  const handleSideBarClick = () => {
    setOpenSideBar(!openSideBar);
  };
  const handleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setBadge(false);
    setNewMessages(0);
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", { message });
      setChats((prevChats) => [
        ...prevChats,
        { message, user: "You", time: new Date().toISOString() },
      ]);
      setMessage("");
    }
  };

  const handleChatChange = (e: any) => {
    setMessage(e.target.value);
  };

  return (
    <div className="overflow-hidden">
      {/* <h1>Room No: {router.query.roomID}</h1> */}
      <div className="h-[100vh] flex gap-20 justify-center items-end relative">
        <div className="p-2 md:p-5 absolute md:left-10 top-0 bg-white shadow-xl flex flex-col justify-center items-center w-full md:w-80  rounded-lg md:my-5">
          <div className="hidden md:block text-2xl text-center font-semibold">
            Whiteboard Sharing App{" "}
          </div>
          <div className="text-blue-500 text-xl md:text-2xl font-semibold">
            Online: {totalUsers.length}
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
        {/* Chat box */}
        <div
          className={` ${
            isChatOpen ? "" : "hidden"
          } bg-gray-100 overflow-hidden animate-icon absolute md:left-10 bottom-28 z-20 shadow-xl rounded-lg mx-10 w-[85%] md:w-96 h-96 flex flex-col justify-start items-start`}
        >
          <div
            className=" p-9 relative w-full rounded-t-lg"
            style={{
              background:
                "radial-gradient( circle farthest-corner at 12.4% 11.7%, rgba(2,83,185,1) 0%, rgba(4,189,228,1) 100.2% )",
            }}
          >
            <p className="text-2xl font-bold text-center tracking-wide text-white">
              Chat Box
            </p>
            <div className="curve"></div>
          </div>

          <div className="bg-gray-100 px-2 h-full  w-full rounded-lg ">
            <div  ref={messagesEndRef} className="MessageBox relative h-[55%] mx-2 px-3 z-30 w-full overflow-y-scroll">
              {/* All messages */}
              {chats.map((msg, index) => (
                <div key={index} className="flex flex-col chatContainer ">
                  <p
                    className={` ${
                      msg.user === "You" ? "myMessage" : "theirMessage"
                    }`}
                  >
                    {msg.message}
                  </p>
                  <small
                    className={`${
                      msg.user === "You"
                        ? "self-end"
                        : "self-start translate-x-2"
                    } text-gray-700 `}
                  >
                    {formatDate(msg.time)}
                  </small>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend}>
              <input
                type="text"
                value={message}
                onChange={handleChatChange}
                className="bg-gray-100 px-2 text-gray-800 absolute bottom-5 w-[90%] h-10 outline-none border-t-2 border-slate-200 left-[50%] translate-x-[-50%]"
                placeholder="Type in a message..."
              />
              <button
                type="submit"
                className="rounded-lg  absolute right-5 p-4 bottom-2 w-10 h-10 flex justify-center items-center cursor-pointer  text-white"
                style={{
                  background:
                    "radial-gradient( circle farthest-corner at 22.4% 21.7%, rgba(2,83,185,1) 0%, rgba(4,189,228,1) 100.2% )",
                }}
              >
                <SendIcon style={{ transform: "translate(2px)" }} />
              </button>
            </form>
          </div>
        </div>

        {/* Chat Button */}
        <div
          onClick={handleChat}
          className="rounded-full  absolute left-6 md:left-10 p-4 bottom-4 md:bottom-7 w-16 h-16 flex justify-center items-center cursor-pointer shadow-xl text-white"
          style={{
            background:
              "radial-gradient( circle farthest-corner at 22.4% 21.7%, rgba(2,83,185,1) 0%, rgba(4,189,228,1) 100.2% )",
          }}
        >
          <div
            className={`p-1 ${
              badge ? "" : "hidden"
            } rounded-full h-5 w-5 bg-red-600 absolute z-50 right-0 top-0 flex justify-center items-center`}
          >
            <span className="text-xs">{Math.ceil(newMessages/2)}</span>
          </div>
          {isChatOpen ? (
            <div>
              <FontAwesomeIcon
                icon={faXmark}
                size="2xl"
                className="animate-icon"
              />
            </div>
          ) : (
            <FontAwesomeIcon
              icon={faMessage}
              size="xl"
              className="animate-icon"
            />
            // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" height="32px" width="32px" role="img"  className="animate-icon" >
            //   <path fillRule="evenodd" clipRule="evenodd" d="M400 26.2c-193.3 0-350 156.7-350 350 0 136.2 77.9 254.3 191.5 312.1 15.4 8.1 31.4 15.1 48.1 20.8l-16.5 63.5c-2 7.8 5.4 14.7 13 12.1l229.8-77.6c14.6-5.3 28.8-11.6 42.4-18.7C672 630.6 750 512.5 750 376.2c0-193.3-156.7-350-350-350zm211.1 510.7c-10.8 26.5-41.9 77.2-121.5 77.2-79.9 0-110.9-51-121.6-77.4-2.8-6.8 5-13.4 13.8-11.8 76.2 13.7 147.7 13 215.3.3 8.9-1.8 16.8 4.8 14 11.7z"></path>
            // </svg>
          )}
        </div>

        {/* Tools */}
        <div className="flex flex-col md:flex-row absolute left-3 transform  translate-y-[-50%] top-1/2 md:top-auto md:left-auto md:bottom-3 md:translate-x-0 md:translate-y-0 justify-center items-center gap-1 md:gap-3">
          <div className="flex flex-col md:flex-row text-[#1a1b1e] justify-center items-center gap-5 p-2 md:p-5  md:h-12 bg-white shadow-xl rounded-lg my-5 ">
            {/* Pencil draw */}
            <div
              className={`flex tooltipAbove relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
                tool === "pencil" ? "bg-[#d9dffc] text-blue-500" : ""
              }`}
              onClick={() => {
                setTool(tool === "pencil" ? "pencil" : "pencil");
                setPenMode(!penMode);
              }}
            >
              <span className={`tooltipAbovetext`}>Pen</span>
              <FontAwesomeIcon icon={faPen} size="lg" />
              {/* Mobile Thickness slider */}
              <div
                className={`${
                  penMode ? "flex md:hidden" : "hidden"
                } flex-col absolute left-16 rounded-xl p-2 justify-center items-center gap-2 cursor-pointer bg-white`}
              >
                <span className={`text-gray-900 font-semibold`}>Thickness</span>
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

            {/* Line */}
            <div
              className={`flex ${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
                tool === "line" ? "bg-[#d9dffc] text-blue-500" : ""
              }`}
              onClick={() => setTool(tool === "line" ? "" : "line")}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Line
              </span>
              <FontAwesomeIcon icon={faSlash} rotation={270} size="lg" />
            </div>
            {/* Rectangle Shape */}
            <div
              className={`flex ${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
                tool === "rect" ? "bg-[#d9dffc] text-blue-500" : ""
              }`}
              onClick={() => setTool(tool === "rect" ? "" : "rect")}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Rectangle
              </span>
              <FontAwesomeIcon icon={faSquareFull} size="lg" />
            </div>
            {/* Circle Shape */}
            <div
              className={`flex ${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative cursor-pointer justify-center items-center gap-2 hover:bg-[#d9dffc] hover:text-blue-500 p-2 rounded-md ${
                tool === "circle" ? "bg-[#d9dffc] text-blue-500" : ""
              }`}
              onClick={() => setTool(tool === "circle" ? "" : "circle")}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Circle
              </span>
              <FontAwesomeIcon icon={faCircle} size="lg" />
            </div>
            {/* Color Input*/}
            <div
              className={`flex ${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative justify-center items-center gap-2 cursor-pointer`}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Color
              </span>
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
            <div
              className={`hidden md:flex ${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative justify-center items-center gap-2 cursor-pointer`}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Thickness
              </span>
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
          <div className="p-1 bg-white shadow-xl flex flex-col md:flex-row justify-center items-center md:h-12 md:w-36 rounded-lg gap-2 md:my-5">
            <div
              className={`${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative`}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Undo
              </span>
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

            <hr
              className="hidden md:block md:h-8"
              style={{ borderLeft: "2px solid #ccc" }}
            />
            {/* <br className="block md:hidden w-8" style={{ borderBottom: "2px solid #ccc" }} /> */}
            <div
              className={`${
                isMobile ? "tooltipRight" : "tooltipAbove"
              } relative`}
            >
              <span
                className={`${
                  isMobile ? "tooltipRighttext" : "tooltipAbovetext"
                }`}
              >
                Redo
              </span>
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
        </div>

        <button
          onClick={handleClearCanvas}
          className="absolute right-5 md:right-14 bottom-0 md:bottom-3 shadow-xl p-2 px-3 h-12 w-36  bg-red-600 hover:bg-red-700 text-white  font-semibold rounded-lg my-5"
        >
          Clear Canvas
        </button>

        <div
          className={` absolute z-10 right-0 flex bg-white rounded-l-2xl ${
            openSideBar ? "translate-x-64" : ""
          }`}
          style={{ transition: "all .7s ease" }}
        >
          <div
            style={{ transition: "all .7s ease" }}
            className={`absolute -left-8 top-[50%] translate-y-[-50%] bg-white z-20 sidebtn w-10 md:w-8  h-40 rounded-l-2xl cursor-pointer shadow-lg flex justify-center items-center`}
            onClick={handleSideBarClick}
          >
            <div className="h-10 w-1 rounded-lg bg-blue-500"></div>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
