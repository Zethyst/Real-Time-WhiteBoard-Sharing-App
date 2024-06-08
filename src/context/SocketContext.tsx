import React, { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  socket: Socket;
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ socket, children }) => (
  <SocketContext.Provider value={{ socket }}>
    {children}
  </SocketContext.Provider>
);
