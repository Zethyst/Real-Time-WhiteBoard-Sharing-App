interface User {
  name: string;
  roomID: string;
  userID: string;
  host: boolean;
  presenter: boolean;
  socketID: string;
}

export const users: User[] = [];
console.log(users);

// Add a user to the list
export const addUser = ({ name, userID, roomID, host, presenter, socketID }: User): User[] => {
  // Check if the user already exists
  const existingUser = users.find((user) => user.userID === userID && user.roomID === roomID);
  if (existingUser) {
    return users; // Return existing users if the user is already present
  }

  const user = { name, userID, roomID, host, presenter, socketID };
  users.push(user);
  return users;
};

// Remove a user from the list
export const removeUser = (id: string): User | undefined => {
  const index = users.findIndex((user) => user.socketID === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return undefined;
};

// Get a user from the list
export const getUser = (id: string): User | undefined => {
  return users.find((user) => user.socketID === id);
};

// Get all users from the room
export const getUsersInRoom = (roomId: string): User[] => {
  return users.filter((user) => user.roomID === roomId);
};
