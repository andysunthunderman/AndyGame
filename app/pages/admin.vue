<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

// 响应式数据
const gameScores = ref<any>({})

// 获取游戏成绩
const loadGameScores = () => {
  try {
    const scores = localStorage.getItem('gameScores')
    if (scores) {
      gameScores.value = JSON.parse(scores)
    }
  } catch (error) {
    console.error('加载成绩失败:', error)
  }
}

// 清除所有成绩
const clearAllScores = () => {
  if (confirm('确定要清除所有游戏成绩吗？此操作不可撤销！')) {
    localStorage.removeItem('gameScores')
    gameScores.value = {}
    alert('所有成绩已清除')
  }
}

// 格式化日期显示
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadGameScores()
})
</script>

<template>
  <div class="admin-page">
    <!-- 返回按钮 -->
    <NuxtLink to="/" class="back-button">
      返回主页
    </NuxtLink>

    <div class="admin-container">
      <h1 class="admin-title">管理后台</h1>
      
      <!-- 操作按钮 -->
      <div class="admin-actions">
        <button class="action-button refresh" @click="loadGameScores">
          刷新数据
        </button>
        <button class="action-button danger" @click="clearAllScores">
          清除所有成绩
        </button>
      </div>

      <!-- 成绩统计 -->
      <div class="scores-section">
        <h2>游戏成绩统计</h2>
        
        <div v-if="Object.keys(gameScores).length === 0" class="no-data">
          暂无游戏成绩数据
        </div>
        
        <div v-for="(dayScores, date) in gameScores" :key="date" class="day-scores">
          <h3 class="date-header">{{ formatDate(date) }}</h3>
          
          <div class="games-grid">
            <div v-for="(gameData, gameName) in dayScores" :key="gameName" class="game-card">
              <div class="game-name">{{ gameName }}</div>
              <div class="game-stats">
                <div class="stat-item">
                  <span class="stat-label">最高分:</span>
                  <span class="stat-value">{{ gameData.highScore }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">游戏次数:</span>
                  <span class="stat-value">{{ gameData.playCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最后游戏:</span>
                  <span class="stat-value">{{ gameData.lastPlayed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 系统信息 -->
      <div class="system-info">
        <h2>系统信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">当前时间:</span>
            <span class="info-value">{{ new Date().toLocaleString('zh-CN') }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">游戏总数:</span>
            <span class="info-value">6</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据存储:</span>
            <span class="info-value">本地存储 (LocalStorage)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.back-button {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.3s ease;
  font-weight: bold;
  z-index: 100;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.admin-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.admin-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.refresh {
  background: #4CAF50;
  color: white;
}

.action-button.danger {
  background: #f44336;
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.scores-section, .system-info {
  margin-bottom: 2rem;
}

.scores-section h2, .system-info h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.no-data {
  text-align: center;
  color: #666;
  font-size: 1.125rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.day-scores {
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.date-header {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #667eea;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.game-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-name {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #333;
}

.game-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  font-weight: bold;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }
  
  .admin-container {
    padding: 1rem;
  }
  
  .admin-title {
    font-size: 2rem;
  }
  
  .admin-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 