<template>
  <div :class="['color-picker-panel', 'panel', { disabled: disabled }]">
    <h3 class="panel-title">
      <span class="title-icon">🎨</span>
      Color Palette
    </h3>
    
    <div class="current-color-display">
      <div 
        class="current-color-preview" 
        :style="{ backgroundColor: currentColor }"
      ></div>
      <div class="current-color-info">
        <span class="color-label">Current Color</span>
        <span class="color-value">{{ currentColor.toUpperCase() }}</span>
      </div>
    </div>
    
    <div class="color-grid">
      <div
        v-for="(color, index) in presetColors"
        :key="color"
        :style="{ backgroundColor: color }"
        :class="['color-option', { selected: currentColor === color }]"
        @click="selectColor(color)"
        :data-tooltip="color"
      >
        <div class="color-option-inner"></div>
      </div>
    </div>
    
    <div class="custom-color-section">
      <label class="custom-color-label">Custom Color</label>
      <div class="custom-color-wrapper">
        <input
          type="color"
          :value="currentColor"
          @input="selectColor($event.target.value)"
          class="custom-color-input"
          :disabled="disabled"
        >
        <div class="custom-color-preview" :style="{ backgroundColor: currentColor }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentColor: String,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['color-change'],
  setup(props, { emit }) {
    const presetColors = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
      '#FFA500', '#A52A2A', '#FF69B4', '#FFD700', '#32CD32', '#87CEEB', '#9370DB', '#F0E68C',
      '#FF6347', '#40E0D0', '#EE82EE', '#F5DEB3', '#DDA0DD', '#B0C4DE', '#F4A460', '#D3D3D3'
    ]
    
    const selectColor = (color) => {
      if (!props.disabled) {
        emit('color-change', color)
      }
    }
    
    return {
      presetColors,
      selectColor
    }
  }
}
</script>

<style scoped>
.color-picker-panel {
  transition: all 0.3s ease;
}

.color-picker-panel.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.current-color-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.current-color-preview {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.current-color-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-value {
  font-family: monospace;
  font-weight: 600;
  color: var(--text-primary);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin-bottom: 1.5rem;
}

.color-option {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-option:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.color-option.selected {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px var(--primary-color), 0 5px 15px rgba(0, 0, 0, 0.3);
}

.color-option-inner {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  transition: opacity 0.3s ease;
}

.color-option:hover .color-option-inner {
  opacity: 1;
}

.custom-color-section {
  margin-top: 1rem;
}

.custom-color-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.custom-color-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.custom-color-input {
  flex: 1;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  background: var(--surface);
  transition: all 0.3s ease;
}

.custom-color-input:hover {
  border-color: var(--primary-color);
}

.custom-color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>