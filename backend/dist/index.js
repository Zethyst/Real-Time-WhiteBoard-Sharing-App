"use strict";
const express = require("express");
const http = require("http");
const app = express();
let { addUser } = require("./dist/Utils/Users");
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
        const users = addUser(data);
        socket.emit("userIsJoined", { success: true, users });
        // Broadcast the existing whiteboard data to the newly joined user
        if (elementGlobal[roomID]) {
            socket.emit("WhiteBoardDataResponse", {
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
        // console.log(roomIdGlobal);
        // console.log(elements);
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
    socket.on("disconnect", () => {
        // console.log("[-] User disconnected!");
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("[+] Server is running on http://localhost:", PORT);
});
