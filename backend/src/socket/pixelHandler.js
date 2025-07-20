const Canvas = require('../models/Canvas')

class PixelHandler {
  constructor(io) {
    this.io = io
    this.rooms = new Map()
    this.users = new Map()
  }
  
  async handleConnection(socket) {
    console.log('User connected:', socket.id)
    
    socket.on('join-room', async (roomId, username) => {
      await this.handleJoinRoom(socket, roomId, username)
    })
    
    socket.on('pixel-update', (data) => {
      this.handlePixelUpdate(socket, data)
    })
    
    socket.on('save-canvas', async () => {
      await this.handleSaveCanvas(socket)
    })
    
    socket.on('disconnect', () => {
      this.handleDisconnect(socket)
    })
  }
  
  async handleJoinRoom(socket, roomId, username) {
    socket.join(roomId)
    this.users.set(socket.id, { username, roomId })
    
    if (!this.rooms.has(roomId)) {
      const existingCanvas = await Canvas.findByRoomId(roomId)
      
      const canvasState = existingCanvas 
        ? existingCanvas.pixel_data 
        : new Array(64).fill(null).map(() => new Array(64).fill('#FFFFFF'))
      
      this.rooms.set(roomId, {
        canvas: canvasState,
        users: new Set(),
        lastSaved: Date.now()
      })
      
      if (!existingCanvas) {
        await Canvas.create(roomId, canvasState)
      }
    }
    
    this.rooms.get(roomId).users.add(socket.id)
    
    socket.emit('canvas-state', this.rooms.get(roomId).canvas)
    this.io.to(roomId).emit('users-update', this.getUsersInRoom(roomId))
  }
  
  handlePixelUpdate(socket, data) {
    const user = this.users.get(socket.id)
    if (!user) return
    
    const room = this.rooms.get(user.roomId)
    if (!room) return
    
    room.canvas[data.y][data.x] = data.color
    socket.to(user.roomId).emit('pixel-changed', data)
    
    if (Date.now() - room.lastSaved > 5000) {
      this.autoSaveCanvas(user.roomId)
      room.lastSaved = Date.now()
    }
  }
  
  async handleSaveCanvas(socket) {
    const user = this.users.get(socket.id)
    if (!user) return
    
    const room = this.rooms.get(user.roomId)
    if (!room) return
    
    try {
      await Canvas.updatePixelData(user.roomId, room.canvas)
      socket.emit('save-success', { message: 'Canvas saved successfully!' })
    } catch (error) {
      socket.emit('save-error', { message: 'Failed to save canvas' })
    }
  }
  
  async autoSaveCanvas(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) return
    
    try {
      await Canvas.updatePixelData(roomId, room.canvas)
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }
  
  handleDisconnect(socket) {
    const user = this.users.get(socket.id)
    if (user && this.rooms.has(user.roomId)) {
      this.rooms.get(user.roomId).users.delete(socket.id)
      this.io.to(user.roomId).emit('users-update', this.getUsersInRoom(user.roomId))
      
      if (this.rooms.get(user.roomId).users.size === 0) {
        this.autoSaveCanvas(user.roomId)
        setTimeout(() => {
          if (this.rooms.get(user.roomId)?.users.size === 0) {
            this.rooms.delete(user.roomId)
          }
        }, 60000)
      }
    }
    this.users.delete(socket.id)
  }
  
  getUsersInRoom(roomId) {
    return Array.from(this.rooms.get(roomId).users).map(id => ({
      id,
      username: this.users.get(id).username
    }))
  }
}

module.exports = PixelHandler