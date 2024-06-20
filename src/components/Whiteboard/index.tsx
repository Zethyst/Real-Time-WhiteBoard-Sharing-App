import React, {
  useEffect,
  useRef,
  RefObject,
  MouseEvent,
  useState,
  useLayoutEffect,
} from "react";
import rough from "roughjs";
import { useRouter } from "next/router";
import { Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";
import { useDispatch } from "react-redux";
import { showMessage } from "@/store/reducers/notificationSlice";

const roughGenerator = rough.generator();

interface Props {
  canvasRef: RefObject<HTMLCanvasElement>;
  contextRef: React.MutableRefObject<CanvasRenderingContext2D | null>;
  elements: any[]; // Update `any[]` to the specific type of your elements array
  setElements: React.Dispatch<React.SetStateAction<any[]>>; // Update `any[]` to the specific type of your elements array
  tool: string;
  color: string;
  fill: boolean;
  thickness: string;
  socket: Socket;
}

const Canvas: React.FC<Props> = ({
  canvasRef,
  contextRef,
  elements,
  setElements,
  tool,
  color,
  fill,
  thickness,
  socket,
}: Props) => {
  const { user, setUser } = useUser();
    const dispatch = useDispatch();
  const router = useRouter();
  const lastX = useRef(0);
  const lastY = useRef(0);

  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [otherElements, setOtherElements] = useState<any[]>([]); // State to store drawings from other users
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("WhiteBoardDataResponse", (data) => {
      // console.log("data:",data);
      if (data.elements) {
        setOtherElements(data.elements); // Set drawings from other users
      }
    });
  }, [socket]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    socket.on("UserJoinedMessageBroadcast",(data:any)=>{
      console.log("Joined",data);
      setTimeout(() => {
        dispatch(showMessage({ message: `${data} joined the room`, messageType: 'info' }));
      }, 1000);
    })
    // console.log(user);
  }, []);

  useEffect(() => {
    return () => {
      socket.emit("userLeft", user);
      const storedUsers = localStorage.getItem("totalUsers");

      if (storedUsers) {
        const usersArray = JSON.parse(storedUsers);

        const updatedUsersArray = usersArray.filter(
          (user: any) => user.userID !== user.userID
        );

        localStorage.setItem("totalUsers", JSON.stringify(updatedUsersArray));
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem("user");
    const storedRoomID = localStorage.getItem("roomID");
    if (storedUser && storedRoomID) {
      const parsedUser = JSON.parse(storedUser);
      const roomPath = `/room/[roomID]`;
      if (router.pathname === roomPath) {
        setUser(parsedUser);
        socket.emit("userJoined", parsedUser);
      } else {
        setLoading(false);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  //! Ensuring canvas remembers the drawings after reloads because of lazy loading of elements state
  useEffect(() => {
    setElements((prev) => [...prev]);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.height = window.innerHeight * 1;
      canvas.width = window.innerWidth * 1;
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (context) {
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.lineCap = "round";
        }
        contextRef.current = context;
        setCtx(context);
        // console.log(contextRef);
      }
    }
  }, [canvasRef]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
    }
  }, [color]);

  const redrawCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if ((elements.length > 0 || otherElements.length > 0) && ctx) {
      // console.log(contextRef)
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }

    const roughCanvas = rough.canvas(canvas);

    const drawElements = (elementsToDraw: any[]) => {
      elementsToDraw.forEach((element) => {
        if (element.type === "pencil") {
          roughCanvas.linearPath(element.path, {
            roughness: 0,
            stroke: element.stroke,
            strokeWidth: element.strokeWidth,
          });
        } else if (element.type === "line") {
          roughCanvas.draw(
            roughGenerator.line(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                roughness: 0,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
              }
            )
          );
        } else if (element.type === "rect") {
          roughCanvas.draw(
            roughGenerator.rectangle(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                roughness: 0,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                fill: element.fill,
                fillStyle: "solid",
              }
            )
          );
        } else if (element.type === "circle") {
          roughCanvas.draw(
            roughGenerator.circle(
              element.offsetX,
              element.offsetY,
              element.width,
              {
                roughness: 0,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                fill: element.fill,
                fillStyle: "solid",
              }
            )
          );
        }
      });
    };

    drawElements(otherElements); // Draw other users' elements
    drawElements(elements); // Draw owner's elements

    socket.emit("WhiteboardData", elements);
  };

  useLayoutEffect(() => {
  
      redrawCanvas();
   
    
  }, [elements, otherElements, ctx, canvasRef, socket]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDrawing(true);
    let offsetX = e.nativeEvent.offsetX;
    let offsetY = e.nativeEvent.offsetY;
    if (tool === "eraser") {
      // setElements((prev: any) => prev.slice(0, -1));
    }
    else if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
          strokeWidth: Number.parseInt(thickness),
        },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color,
          strokeWidth: Number.parseInt(thickness),
        },
      ]);
    } else if (tool === "rect") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "rect",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
          fill: fill? color:"",
          strokeWidth: Number.parseInt(thickness),
        },
      ]);
    } else if (tool === "circle") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "circle",
          offsetX,
          offsetY,
          width: 0,
          stroke: color,
          fill: fill? color:"",
          strokeWidth: Number.parseInt(thickness),
        },
      ]);
    }
    lastX.current = offsetX;
    lastY.current = offsetY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing) {
      return;
    }
    const currentX = e.nativeEvent.offsetX;
    const currentY = e.nativeEvent.offsetY;

    const context = contextRef.current;
    if (context) {
      context.beginPath();
      context.moveTo(lastX.current, lastY.current);
      context.lineTo(currentX, currentY);
      context.stroke();
    }
    
    if (tool === "eraser") {
      setElements((prevElements) => {
        return prevElements.filter((element) => {
          if (element.type === "pencil") {
            // Check if any point in the path is close to the eraser point
            const { path, strokeWidth } = element;
            for (let j = 0; j < path.length; j++) {
              const [x, y] = path[j];
              if (
                Math.abs(x - currentX) < strokeWidth / 2 &&
                Math.abs(y - currentY) < strokeWidth / 2
              ) {
                return false; // Remove the element
              }
            }
            return true;
          } else {
            // For other shapes, check if the eraser point is within the shape bounds
            const { offsetX, offsetY, width, height } = element;
            if (element.type === "line") {
              const x1 = offsetX;
              const y1 = offsetY;
              const x2 = width;
              const y2 = height;
              const isPointOnLine = (x: number, y: number) => {
                const distance =
                  Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
                  Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
                return distance < Number.parseInt(thickness);
              };
              return !isPointOnLine(currentX, currentY);
            } 
            else if (element.type === "circle") {
              const { offsetX, offsetY, width } = element;
              const radius = width / 2;
              const distance = Math.sqrt(
                (currentX - (offsetX + radius)) ** 2 +
                (currentY - (offsetY + radius)) ** 2
              );
              return distance > radius;
            }else {
              const x2 = offsetX + width;
              const y2 = offsetY + height;
              const isPointInRectangle =
                currentX >= Math.min(offsetX, x2) &&
                currentX <= Math.max(offsetX, x2) &&
                currentY >= Math.min(offsetY, y2) &&
                currentY <= Math.max(offsetY, y2);
              return !isPointInRectangle;
            }
          }
        });
      });
      redrawCanvas();
    }
    else if (tool === "pencil") {
      const { path } = elements[elements.length - 1];
      const newPath = [...path, [currentX, currentY]];
      setElements((prevElements) =>
        prevElements.map((ele, index) => {
          if (index === prevElements.length - 1) {
            return {
              ...ele,
              path: newPath,
            };
          } else {
            return ele;
          }
        })
      );
    } else if (tool === "line") {
      setElements((prevElements) =>
        prevElements.map((ele, index) => {
          if (index === prevElements.length - 1) {
            return {
              ...ele,
              width: currentX,
              height: currentY,
            };
          } else {
            return ele;
          }
        })
      );
    } else if (tool === "rect") {
      setElements((prevElements) =>
        prevElements.map((ele, index) => {
          if (index === prevElements.length - 1) {
            return {
              ...ele,
              width: currentX - ele.offsetX,
              height: currentY - ele.offsetY,
            };
          } else {
            return ele;
          }
        })
      );
    } else if (tool === "circle") {
      setElements((prevElements) =>
        prevElements.map((ele, index) => {
          if (index === prevElements.length - 1) {
            return {
              ...ele,
              width: currentX - ele.offsetX,
            };
          } else {
            return ele;
          }
        })
      );
    }

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  return (
    <>
      <div
        className={`bg-white ${
          loading ? "" : "hidden"
        } relative left-[50%] translate-x-[-50%] border py-2 px-5 rounded-lg justify-center flex items-center flex-col`}
      >
        <div className="loader-dots  relative w-20 h-5 mt-2 flex justify-center items-center">
          <div className="absolute  top-0 mt-1 w-3 h-3 rounded-full bg-green-500"></div>
          <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-green-500"></div>
          <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-green-500"></div>
          <div className="absolute top-0 mt-1 w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-500  font-semibold text-md mt-2 text-center">
          Connecting to client...
        </div>
      </div>
      <div
        className=" h-full w-full overflow-hidden "
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} className={`${tool === "pencil"?"pen":""} ${tool === "eraser"?"eraser":""}`}/>
      </div>
    </>
  );
};

export default Canvas;
