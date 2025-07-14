import app from './server.js';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

const roomCode = {}; // in-memory cache

// Folder to save room files
const roomsDir = path.resolve('./rooms');
if (!fs.existsSync(roomsDir)) {
  fs.mkdirSync(roomsDir);
}

const getRoomFilePath = (roomId) => path.join(roomsDir, `${roomId}.txt`);

//  Cleanup inactive rooms (older than 5 hours)
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

const cleanupOldRooms = () => {
  console.log(` Running cleanup job...`);
  fs.readdir(roomsDir, (err, files) => {
    if (err) {
      console.error(` Failed to read rooms dir:`, err);
      return;
    }

    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(roomsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(` Failed to stat file ${file}:`, err);
          return;
        }

        if (now - stats.mtimeMs > FIVE_HOURS_MS) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(` Failed to delete ${file}:`, err);
            } else {
              console.log(` Deleted old room file: ${file}`);
              const roomId = path.basename(file, '.txt');
              delete roomCode[roomId];
            }
          });
        }
      });
    });
  });
};

// Run cleanup every hour
setInterval(cleanupOldRooms, 60 * 60 * 1000);

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(` ${socket.id} joined room ${roomId}`);

    // Load from memory or disk
    if (roomCode[roomId]) {
      socket.emit('initial-code', { code: roomCode[roomId] });
    } else {
      const filePath = getRoomFilePath(roomId);
      if (fs.existsSync(filePath)) {
        const savedCode = fs.readFileSync(filePath, 'utf-8');
        roomCode[roomId] = savedCode;
        socket.emit('initial-code', { code: savedCode });
      }
    }

    socket.to(roomId).emit('peer-connected', socket.id);
  });

  socket.on('signal', ({ roomId, signalData }) => {
    socket.to(roomId).emit('signal', {
      senderId: socket.id,
      signalData
    });
  });

  socket.on('code-change', ({ roomId, code }) => {
    console.log(` Code change in room ${roomId}`);
    roomCode[roomId] = code;

    const filePath = getRoomFilePath(roomId);
    fs.writeFile(filePath, code, (err) => {
      if (err) console.error(` Failed to save code for room ${roomId}:`, err);
    });

    socket.to(roomId).emit('code-change', { code });
  });

  socket.on('disconnect', () => {
    console.log(` User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server + Socket.IO running at http://localhost:${PORT}`);
  cleanupOldRooms(); // run once at start
});
