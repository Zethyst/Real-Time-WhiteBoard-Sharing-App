export {};
interface User {
  name: string;
  roomID: string;
  userID: string;
  host: boolean;
  presenter: boolean;
}

const users: User[] = [];

// Add a user to the list

const addUser = ({ name, userID, roomID, host, presenter }: User) => {
  const user = { name, userID, roomID, host, presenter };
  users.push(user);
  return user;
};

// Remove a user from the list

const removeUser = (id: string) => {
  const index = users.findIndex((user) => user.userID === id);
  if (index === -1) {
    //! If no user is found
    return users.splice(index, 1)[0];
  }
  // return users;
};

// Get a user from the list

const getUser = (id: string) => {
  return users.find((user) => user.userID === id); //finding user with userId
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
