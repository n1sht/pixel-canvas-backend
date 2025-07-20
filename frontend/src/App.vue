<template>
  <div class="app" @keydown="handleGlobalKeydown" tabindex="0">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">🎨</div>
          <h1>Pixel Canvas</h1>
        </div>
        <div class="room-section" v-if="!connected">
          <input 
            v-model="username" 
            placeholder="Your name"
            @keyup.enter="joinRoom"
            class="input-field username-input"
          >
          <input 
            v-model="roomId" 
            placeholder="Room ID"
            @keyup.enter="joinRoom"
            class="input-field room-input"
          >
          <button @click="joinRoom" :disabled="!username || !roomId" class="join-btn">
            Join Room
          </button>
        </div>
        <div class="room-info-display" v-else>
          <div class="user-badge">
            <span class="user-icon">👤</span>
            {{ username }}
          </div>
          <div class="room-badge">
            <span class="room-icon">🏠</span>
            {{ roomId }}
          </div>
          <button @click="disconnect" class="disconnect-btn">
            Leave
          </button>
        </div>
      </div>
    </header>
    
    <main class="app-main" v-if="connected">
      <aside class="sidebar left-sidebar">
        <div class="panel tools-panel">
          <h3 class="panel-title">
            <span class="title-icon">🛠️</span>
            Tools
          </h3>
          <div class="tool-buttons">
            <button 
              :class="['tool-btn', { active: activeTool === 'pen' }]"
              @click="setTool('pen')"
              title="Pen (P)"
            >
              <span class="tool-icon">✏️</span>
              <span class="tool-label">Pen</span>
              <span class="tool-shortcut">P</span>
            </button>
            <button 
              :class="['tool-btn', { active: activeTool === 'eraser' }]"
              @click="setTool('eraser')"
              title="Eraser (E)"
            >
              <span class="tool-icon">🧹</span>
              <span class="tool-label">Eraser</span>
              <span class="tool-shortcut">E</span>
            </button>
          </div>
        </div>
        
        <div class="panel brush-panel">
          <h3 class="panel-title">
            <span class="title-icon">⚙️</span>
            Brush Size
          </h3>
          <div class="brush-size-control">
            <input 
              type="range" 
              v-model="brushSize" 
              min="1" 
              max="10" 
              class="brush-slider"
            >
            <div class="brush-preview">
              <div 
                class="brush-dot" 
                :style="{ 
                  width: brushSize * 4 + 'px', 
                  height: brushSize * 4 + 'px',
                  backgroundColor: activeTool === 'eraser' ? '#e0e0e0' : currentColor
                }"
              ></div>
              <span class="brush-size-label">{{ brushSize }}px</span>
            </div>
          </div>
        </div>
        
        <div class="panel shortcuts-panel">
          <h3 class="panel-title">
            <span class="title-icon">⌨️</span>
            Shortcuts
          </h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <kbd>Ctrl+Z</kbd> Undo
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl+Shift+Z</kbd> Redo
            </div>
            <div class="shortcut-item">
              <kbd>P</kbd> Pen Tool
            </div>
            <div class="shortcut-item">
              <kbd>E</kbd> Eraser
            </div>
          </div>
        </div>
      </aside>
      
      <div class="canvas-container">
        <div class="canvas-wrapper">
          <PixelCanvas 
            :socket="socket"
            :currentColor="currentColor"
            :activeTool="activeTool"
            :brushSize="brushSize"
          />
        </div>
      </div>
      
      <aside class="sidebar right-sidebar">
        <ColorPicker 
          :currentColor="currentColor"
          @color-change="currentColor = $event"
          :disabled="activeTool === 'eraser'"
        />
        
        <OnlineUsers 
          :users="onlineUsers"
        />
      </aside>
    </main>
    
    <div v-else class="welcome-screen" v-show="!connected">
      <div class="welcome-content">
        <div class="welcome-icon">🎨</div>
        <h2>Welcome to Pixel Canvas</h2>
        <p>Create collaborative pixel art in real-time with friends!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import PixelCanvas from './components/PixelCanvas.vue'
import ColorPicker from './components/ColorPicker.vue'
import OnlineUsers from './components/OnlineUsers.vue'

export default {
  components: {
    PixelCanvas,
    ColorPicker,
    OnlineUsers
  },
  setup() {
    const socket = ref(null)
    const connected = ref(false)
    const username = ref('')
    const roomId = ref('default-room')
    const currentColor = ref('#000000')
    const onlineUsers = ref([])
    const activeTool = ref('pen')
    const brushSize = ref(1)
    
    const joinRoom = () => {
      if (!username.value || !roomId.value) return
      
      socket.value = io('http://localhost:3001')
      
      socket.value.on('connect', () => {
        connected.value = true
        socket.value.emit('join-room', roomId.value, username.value)
      })
      
      socket.value.on('users-update', (users) => {
        onlineUsers.value = users
      })
      
      socket.value.on('disconnect', () => {
        connected.value = false
      })
    }
    
    const disconnect = () => {
      if (socket.value) {
        socket.value.disconnect()
        connected.value = false
      }
    }
    
    const setTool = (tool) => {
      activeTool.value = tool
    }
    
    const handleGlobalKeydown = (e) => {
      if (e.target.tagName === 'INPUT') return
      
      switch(e.key.toLowerCase()) {
        case 'p':
          setTool('pen')
          break
        case 'e':
          setTool('eraser')
          break
      }
    }
    
    onMounted(() => {
      window.addEventListener('keydown', handleGlobalKeydown)
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleGlobalKeydown)
      if (socket.value) {
        socket.value.disconnect()
      }
    })
    
    return {
      socket,
      connected,
      username,
      roomId,
      currentColor,
      onlineUsers,
      activeTool,
      brushSize,
      joinRoom,
      disconnect,
      setTool,
      handleGlobalKeydown
    }
  }
}
</script>