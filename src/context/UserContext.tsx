import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  roomID: string;
  userID: string;
  host: boolean;
  presenter: boolean;
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  totalUsers: User[];
  setTotalUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState<User[]>([]);

  return (
    <UserContext.Provider value={{ user, setUser, totalUsers, setTotalUsers }}>
      {children}
    </UserContext.Provider>
  );
};
