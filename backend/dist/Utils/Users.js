"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users = [];
console.log(users);
// Add a user to the list
const addUser = ({ name, userID, roomID, host, presenter, socketID }) => {
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
const removeUser = (id) => {
    const index = users.findIndex((user) => user.socketID === id);
    if (index === -1) {
        //! If no user is found
        return users.splice(index, 1)[0];
    }
    // return users;
};
// Get a user from the list
const getUser = (id) => {
    return users.find((user) => user.socketID === id); //finding user with userId
};
// Get all users from the room
const getUsersInRoom = (roomId) => {
    return users.filter((user) => user.roomID === roomId);
};
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
