import express, { Request, Response } from 'express';
import http from 'http';
import next from 'next';
import socketIo, { Socket } from 'socket.io';
import { addUser, getUser, removeUser } from './Utils/Users';

interface User {
    name: string;
    roomID: string;
    userID: string;
    host: boolean;
    presenter: boolean;
    socketID: string;
}

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  const io = new socketIo.Server(server);

  const elementGlobal: { [key: string]: any[] } = {}; // Global storage for elements per room
  let roomIdGlobal: string;

  io.on('connection', (socket: Socket) => {
    socket.on('userJoined', (data: User) => {
      const { name, userID, roomID, host, presenter } = data;
      socket.join(roomID);
      roomIdGlobal = roomID;
      const users = addUser({ name, userID, roomID, host, presenter, socketID: socket.id });

      socket.emit('userIsJoined', { success: true, users });
      socket.broadcast.to(roomIdGlobal).emit('allUsers', users);
      socket.broadcast.to(roomIdGlobal).emit('UserJoinedMessageBroadcast', name);

      if (elementGlobal[roomID]) {
        socket.broadcast.to(roomIdGlobal).emit('WhiteBoardDataResponse', {
          element: elementGlobal[roomID],
        });
      } else {
        elementGlobal[roomID] = [];
      }
    });

    socket.on('WhiteboardData', (data: any) => {
      const elements = data;
      if (!elementGlobal[roomIdGlobal]) {
        elementGlobal[roomIdGlobal] = [];
      }
      elementGlobal[roomIdGlobal].push(elements);
      socket.broadcast.to(roomIdGlobal).emit('WhiteBoardDataResponse', {
        elements: elements,
      });
    });

    socket.on('message', (data: { message: string }) => {
      const { message } = data;
      const timestamp = new Date().toISOString();
      const user = getUser(socket.id);
      if (user) {
        socket.broadcast.to(roomIdGlobal).emit('MessageResponse', { message, user: user.name, time: timestamp });
      }
    });

    socket.on('userLeft', () => {
      const user = getUser(socket.id);
      if (user) {
        removeUser(socket.id);
        socket.broadcast.to(roomIdGlobal).emit('UserLeftMessageBroadcast', user.name);
      }
    });
  });

  app.get('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, (err?: any) => {
    if (err) throw err;
    console.log('[+] Server is running on http://localhost:', PORT);
  });
});
