"use strict";
const express = require("express");
const http = require("http");
const app = express();
let { addUser, getUser, removeUser } = require("./Utils/Users");
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server);
//Routes
app.get("/", (req, res) => {
    res.send("Hey");
});
const elementGlobal = {}; // Global storage for elements per room
let roomIdGlobal;
io.on("connection", (socket) => {
    // console.log("[+] User connected!");
    socket.on("userJoined", (data) => {
        const { name, userID, roomID, host, presenter } = data;
        socket.join(roomID);
        roomIdGlobal = roomID;
        const users = addUser({ name, userID, roomID, host, presenter, socketID: socket.id });
        // console.log(users);
        socket.emit("userIsJoined", { success: true, users });
        socket.broadcast.to(roomIdGlobal).emit("allUsers", users);
        socket.broadcast.to(roomIdGlobal).emit("UserJoinedMessageBroadcast", name);
        // Broadcast the existing whiteboard data to the newly joined user
        if (elementGlobal[roomID]) {
            socket.broadcast.to(roomIdGlobal).emit("WhiteBoardDataResponse", {
                element: elementGlobal[roomID],
            });
        }
        else {
            elementGlobal[roomID] = [];
        }
    });
    socket.on("WhiteboardData", (data) => {
        // console.log(data);
        const elements = data;
        // Store the elements data per room
        if (!elementGlobal[roomIdGlobal]) {
            elementGlobal[roomIdGlobal] = [];
        }
        elementGlobal[roomIdGlobal].push(elements);
        // Broadcast to others in the same room
        socket.broadcast.to(roomIdGlobal).emit("WhiteBoardDataResponse", {
            elements: elements,
        });
    });
    socket.on("message", (data) => {
        const { message } = data;
        const timestamp = new Date().toISOString();
        const user = getUser(socket.id);
        if (user) {
            socket.broadcast.to(roomIdGlobal).emit("MessageResponse", { message, user: user.name, time: timestamp });
        }
    });
    socket.on("userLeft", () => {
        const user = getUser(socket.id);
        // console.log("Left");
        if (user) {
            removeUser(socket.id);
            socket.broadcast.to(roomIdGlobal).emit("UserLeftMessageBroadcast", user.name);
        }
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("[+] Server is running on http://localhost:", PORT);
});
