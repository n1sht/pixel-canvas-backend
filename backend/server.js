const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Update CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Add this for better compatibility
});

// Add a test route
app.get('/', (req, res) => {
  res.json({ status: 'Pixel Canvas Backend Running', timestamp: new Date() });
});

const rooms = new Map();
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId, username) => {
    socket.join(roomId);
    users.set(socket.id, { username, roomId });
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        canvas: new Array(64).fill(null).map(() => new Array(64).fill('#FFFFFF')),
        users: new Set()
      });
    }
    
    rooms.get(roomId).users.add(socket.id);
    
    socket.emit('canvas-state', rooms.get(roomId).canvas);
    io.to(roomId).emit('users-update', Array.from(rooms.get(roomId).users).map(id => users.get(id)));
  });
  
  socket.on('pixel-update', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    const room = rooms.get(user.roomId);
    if (!room) return;
    
    room.canvas[data.y][data.x] = data.color;
    socket.to(user.roomId).emit('pixel-changed', data);
  });
  
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user && rooms.has(user.roomId)) {
      rooms.get(user.roomId).users.delete(socket.id);
      io.to(user.roomId).emit('users-update', Array.from(rooms.get(user.roomId).users).map(id => users.get(id)));
    }
    users.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});