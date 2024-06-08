import "@/styles/globals.css";
import type { AppProps } from "next/app";
import io, { Socket } from "socket.io-client";
import { SocketProvider } from "@/context/SocketContext";
import { UserProvider } from "../context/UserContext";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";

const server = "http://localhost:5000";

interface ConnectionTypes {
  "force new connection": boolean;
  reconnectionAttempts: number;
  timeout: number;
  transports: string[];
}
const connectionOptions: ConnectionTypes = {
  "force new connection": true, //Always create a new connection
  reconnectionAttempts: Infinity, // Changed to number, infinite times a user can attempt reconnection
  timeout: 10000, //After this connection fails
  transports: ["websocket"],
};

const socket: Socket = io(server, connectionOptions); //is used to emit any type of event

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SocketProvider socket={socket}>
      <UserProvider>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </UserProvider>
    </SocketProvider>
  );
}
