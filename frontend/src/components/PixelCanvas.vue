<template>
  <canvas 
    ref="canvasRef"
    class="pixel-canvas"
    :width="canvasSize"
    :height="canvasSize"
    @mousedown="startDrawing"
    @mousemove="draw"
    @mouseup="stopDrawing"
    @mouseleave="stopDrawing"
    tabindex="0"
    @keydown="handleKeydown"
  ></canvas>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue'

export default {
  props: {
    socket: Object,
    currentColor: String,
    activeTool: String,
    brushSize: Number
  },
  setup(props) {
    const canvasRef = ref(null)
    const gridSize = 64
    const canvasSize = 640
    const pixelSize = canvasSize / gridSize
    const isDrawing = ref(false)
    const canvasData = ref(Array(gridSize).fill(null).map(() => Array(gridSize).fill('#FFFFFF')))
    const history = ref([])
    const historyStep = ref(-1)
    const currentStroke = ref([])
    
    const getPixelCoords = (e) => {
      const rect = canvasRef.value.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / pixelSize)
      const y = Math.floor((e.clientY - rect.top) / pixelSize)
      return { x, y }
    }
    
    const drawPixel = (x, y, color, addToStroke = false) => {
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return
      
      const ctx = canvasRef.value.getContext('2d')
      ctx.fillStyle = color
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      
      const oldColor = canvasData.value[y][x]
      canvasData.value[y][x] = color
      
      if (addToStroke && oldColor !== color) {
        currentStroke.value.push({ x, y, color, oldColor })
      }
    }
    
    const drawBrush = (centerX, centerY, color) => {
      const radius = Math.floor(props.brushSize / 2)
      
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          if (x * x + y * y <= radius * radius) {
            const pixelX = centerX + x
            const pixelY = centerY + y
            drawPixel(pixelX, pixelY, color, true)
            
            if (props.socket && pixelX >= 0 && pixelX < gridSize && pixelY >= 0 && pixelY < gridSize) {
              props.socket.emit('pixel-update', {
                x: pixelX,
                y: pixelY,
                color
              })
            }
          }
        }
      }
    }
    
    const saveStrokeToHistory = () => {
      if (currentStroke.value.length === 0) return
      
      const newHistory = history.value.slice(0, historyStep.value + 1)
      newHistory.push([...currentStroke.value])
      history.value = newHistory
      historyStep.value = newHistory.length - 1
      currentStroke.value = []
    }
    
    const undo = () => {
      if (historyStep.value >= 0) {
        const stroke = history.value[historyStep.value]
        stroke.forEach(({ x, y, oldColor }) => {
          drawPixel(x, y, oldColor)
          if (props.socket) {
            props.socket.emit('pixel-update', { x, y, color: oldColor })
          }
        })
        historyStep.value--
      }
    }
    
    const redo = () => {
      if (historyStep.value < history.value.length - 1) {
        historyStep.value++
        const stroke = history.value[historyStep.value]
        stroke.forEach(({ x, y, color }) => {
          drawPixel(x, y, color)
          if (props.socket) {
            props.socket.emit('pixel-update', { x, y, color })
          }
        })
      }
    }
    
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        redo()
      }
    }
    
    const startDrawing = (e) => {
      isDrawing.value = true
      currentStroke.value = []
      draw(e)
    }
    
    const draw = (e) => {
      if (!isDrawing.value) return
      
      const { x, y } = getPixelCoords(e)
      const color = props.activeTool === 'eraser' ? '#FFFFFF' : props.currentColor
      
      if (props.brushSize === 1) {
        if (canvasData.value[y][x] !== color) {
          drawPixel(x, y, color, true)
          if (props.socket) {
            props.socket.emit('pixel-update', { x, y, color })
          }
        }
      } else {
        drawBrush(x, y, color)
      }
    }
    
    const stopDrawing = () => {
      if (isDrawing.value) {
        isDrawing.value = false
        saveStrokeToHistory()
      }
    }
    
    const renderCanvas = () => {
      const ctx = canvasRef.value.getContext('2d')
      ctx.clearRect(0, 0, canvasSize, canvasSize)
      
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          drawPixel(x, y, canvasData.value[y][x])
        }
      }
    }
    
    onMounted(() => {
      renderCanvas()
      canvasRef.value.focus()
      
      if (props.socket) {
        props.socket.on('canvas-state', (state) => {
          canvasData.value = state
          renderCanvas()
          history.value = []
          historyStep.value = -1
        })
        
        props.socket.on('pixel-changed', (data) => {
          drawPixel(data.x, data.y, data.color)
        })
      }
    })
    
    return {
      canvasRef,
      canvasSize,
      startDrawing,
      draw,
      stopDrawing,
      handleKeydown
    }
  }
}
</script>