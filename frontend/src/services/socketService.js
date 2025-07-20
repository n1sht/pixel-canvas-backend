import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
  }
  
  connect(url = 'http://localhost:3001') {
    this.socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    return this.socket
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
  
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }
  
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }
  
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export default new SocketService()