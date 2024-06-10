export {};
interface User {
  name: string;
  roomID: string;
  userID: string;
  host: boolean;
  presenter: boolean;
  socketID: string
}

const users: User[] = [];
console.log(users);

// Add a user to the list

const addUser = ({ name, userID, roomID, host, presenter, socketID }: User) => {
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

const removeUser = (id: string) => {
  const index = users.findIndex((user) => user.socketID === id);
  if (index === -1) {
    //! If no user is found
    return users.splice(index, 1)[0];
  }
  // return users;
};

// Get a user from the list

const getUser = (id: string) => {
  return users.find((user) => user.socketID === id); //finding user with userId
};

// Get all users from the room

const getUsersInRoom = (roomId: string) => {
  return users.filter((user) => user.roomID === roomId);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
