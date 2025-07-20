<template>
  <div class="online-users-panel panel">
    <h3 class="panel-title">
      <span class="title-icon">👥</span>
      Online Users
      <span class="user-count">{{ users.length }}</span>
    </h3>
    
    <div class="user-list" v-if="users.length > 0">
      <transition-group name="user-list" tag="div">
        <div 
          v-for="user in users" 
          :key="user.id" 
          class="user-item"
        >
          <div class="user-avatar">
            {{ getInitials(user.username) }}
          </div>
          <span class="user-name">{{ user.username }}</span>
          <div class="user-status"></div>
        </div>
      </transition-group>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">🎨</div>
      <p class="empty-message">Waiting for artists...</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getInitials(name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
  }
}
</script>

<style scoped>
.user-count {
  margin-left: auto;
  background: var(--primary-color);
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.user-list::-webkit-scrollbar {
  width: 4px;
}

.user-list::-webkit-scrollbar-track {
  background: var(--surface);
  border-radius: 2px;
}

.user-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.user-list::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: var(--primary-color);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.user-item:hover {
  background: var(--surface-light);
  transform: translateX(5px);
}

.user-item:hover::before {
  transform: translateX(0);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.user-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
}

.user-status {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  }
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-message {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.user-list-enter-active,
.user-list-leave-active {
  transition: all 0.3s ease;
}

.user-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.user-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.user-list-move {
  transition: transform 0.3s ease;
}
</style>