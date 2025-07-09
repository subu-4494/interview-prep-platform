// index.js

import app from './server.js';
import http from 'http';
import {Server } from 'socket.io';
import { startCleanupExpiredSlotsJob } from './jobs/cleanexpiredjobs.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // or your frontend origin
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
  console.log(` User connected: ${socket.id}`);

  // Join room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('peer-connected', socket.id);
  });

  // Signal (offer/answer/ICE)
  socket.on('signal', ({ roomId, signalData }) => {
    socket.to(roomId).emit('signal', {
      senderId: socket.id,
      signalData
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(` User disconnected: ${socket.id}`);
    // Optional: notify room about peer leaving
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server + Socket.IO running at http://localhost:${PORT}`);
  startCleanupExpiredSlotsJob();
});
