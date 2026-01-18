<template>
  <div class="game-layout">
    <!-- 侧边导航栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 折叠按钮 -->
      <button class="sidebar-toggle" @click="toggleSidebar">
        <span v-if="sidebarCollapsed">☰</span>
        <span v-else>×</span>
      </button>

      <!-- 导航内容 -->
      <div class="sidebar-content" v-show="!sidebarCollapsed">
        <div class="sidebar-header">
          <h3>🎮 Game Center</h3>
        </div>

        <!-- 返回主页按钮 -->
        <NuxtLink to="/" class="nav-item home-button">
          🏠 Home
        </NuxtLink>

        <!-- 游戏导航列表 -->
        <div class="game-nav">
          <h4>Game List</h4>
          <NuxtLink to="/games/fishing" class="nav-item game-link">
            🎣 Deep Sea Fishing
          </NuxtLink>
          <NuxtLink to="/games/snake" class="nav-item game-link">
            🐍 Snake
          </NuxtLink>
          <NuxtLink to="/games/minesweeper" class="nav-item game-link">
            💣 Minesweeper
          </NuxtLink>
          <NuxtLink to="/games/plane" class="nav-item game-link">
            ✈️ Plane Battle
          </NuxtLink>
          <NuxtLink to="/games/tank" class="nav-item game-link">
            🚗 Tank Battle
          </NuxtLink>
          <NuxtLink to="/games/typing" class="nav-item game-link">
            ⌨️ Typing Challenge
          </NuxtLink>
          <NuxtLink to="/games/bottle" class="nav-item game-link">
            🍾 Message in a Bottle
          </NuxtLink>
        </div>
      </div>

      <!-- 折叠状态下的快捷图标 -->
      <div class="sidebar-icons" v-show="sidebarCollapsed">
        <NuxtLink to="/" class="icon-button" title="Home">🏠</NuxtLink>
        <NuxtLink to="/games/fishing" class="icon-button" title="Deep Sea Fishing">🎣</NuxtLink>
        <NuxtLink to="/games/snake" class="icon-button" title="Snake">🐍</NuxtLink>
        <NuxtLink to="/games/minesweeper" class="icon-button" title="Minesweeper">💣</NuxtLink>
        <NuxtLink to="/games/plane" class="icon-button" title="Plane Battle">✈️</NuxtLink>
        <NuxtLink to="/games/tank" class="icon-button" title="Tank Battle">🚗</NuxtLink>
        <NuxtLink to="/games/typing" class="icon-button" title="Typing Challenge">⌨️</NuxtLink>
        <NuxtLink to="/games/bottle" class="icon-button" title="Message in a Bottle">🍾</NuxtLink>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'content-expanded': sidebarCollapsed }">
      <slot />
    </div>

    <!-- 遮罩层（移动端） -->
    <div 
      class="sidebar-overlay" 
      v-show="!sidebarCollapsed && isMobile" 
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sidebarCollapsed = ref(false)
const isMobile = ref(false)

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 处理窗口大小变化
const handleResize = () => {
  checkMobile()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.game-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
  width: 60px;
}

/* 折叠按钮 */
.sidebar-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 侧边栏内容 */
.sidebar-content {
  padding: 60px 20px 20px;
}

.sidebar-header h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* 导航项目样式 */
.nav-item {
  display: block;
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.home-button {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  margin-bottom: 20px;
  font-weight: bold;
}

.home-button:hover {
  background: linear-gradient(135deg, #ff5252, #ff3d00);
  transform: translateX(5px) scale(1.02);
}

/* 游戏导航区域 */
.game-nav h4 {
  margin: 20px 0 10px 0;
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.game-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 折叠状态下的图标 */
.sidebar-icons {
  padding: 60px 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
  position: relative;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.icon-button.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.content-expanded {
  margin-left: 60px;
}

/* 遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    transform: translateX(-100%);
  }
  
  .sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
  }
  
  .sidebar-collapsed {
    width: 60px;
    transform: translateX(-100%);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .content-expanded {
    margin-left: 0;
  }
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 