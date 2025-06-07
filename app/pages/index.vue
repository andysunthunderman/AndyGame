<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'home',
})

// 响应式数据
const currentDate = ref('加载中...')
const currentTime = ref('加载中...')
const searchTerm = ref('')
const showManual = ref(false)
const showWeather = ref(false)
const weatherInfo = ref('正在获取天气信息...')
const noResults = ref(false)
let timeInterval: NodeJS.Timeout

// 游戏数据
const games = ref([
  {
    id: 'minesweeper',
    title: '扫雷游戏',
    description: '经典的扫雷游戏，考验你的逻辑思维和运气！',
    link: '/games/minesweeper',
    color: 'bg-blue-500 hover:bg-blue-600',
    image: 'minesweeper'
  },
  {
    id: 'tank',
    title: '多人坦克对战',
    description: '控制你的坦克，在战场上与其他玩家对战！',
    link: '/games/tank',
    color: 'bg-green-500 hover:bg-green-600',
    image: 'tank'
  },
  {
    id: 'plane',
    title: '飞机大战',
    description: '控制你的飞机，躲避敌人的攻击并击落敌机！',
    link: '/games/plane',
    color: 'bg-purple-500 hover:bg-purple-600',
    image: 'plane'
  },
  {
    id: 'snake',
    title: '贪吃蛇',
    description: '经典的贪吃蛇游戏，控制蛇吃食物并成长！',
    link: '/games/snake',
    color: 'bg-orange-500 hover:bg-orange-600',
    image: 'snake'
  },
  {
    id: 'fishing',
    title: '深海捕鱼',
    description: '体验刺激的深海捕鱼，收集各种稀有鱼类！',
    link: '/games/fishing',
    color: 'bg-cyan-500 hover:bg-cyan-600',
    image: 'fishing'
  },
  {
    id: 'typing',
    title: '打字挑战',
    description: '提升你的打字速度和准确率，挑战自我！',
    link: '/games/typing',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    image: 'typing'
  }
])

// 计算属性：过滤后的游戏
const filteredGames = computed(() => {
  if (!searchTerm.value) {
    noResults.value = false
    return games.value
  }
  
  const filtered = games.value.filter(game => 
    game.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
  
  noResults.value = filtered.length === 0
  return filtered
})

// 更新时间函数
const updateDateTime = () => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  currentDate.value = now.toLocaleDateString('zh-CN', options)
  currentTime.value = now.toLocaleTimeString('zh-CN', timeOptions)
}

// 获取天气信息
const getWeather = async () => {
  try {
    const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Beijing&appid=YOUR_API_KEY&units=metric&lang=zh_cn')
    if (response.ok) {
      const data = await response.json()
      weatherInfo.value = `城市: ${data.name}\\n温度: ${data.main.temp}°C\\n天气: ${data.weather[0].description}\\n湿度: ${data.main.humidity}%`
    } else {
      weatherInfo.value = '无法获取天气信息，请稍后再试'
    }
  } catch (error) {
    weatherInfo.value = '天气服务暂时不可用'
  }
}

// 组件挂载
onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
})

// 组件卸载
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 方法
const openWeather = () => {
  showWeather.value = true
  getWeather()
}

const closeWeather = () => {
  showWeather.value = false
}

const openManual = () => {
  showManual.value = true
}

const closeManual = () => {
  showManual.value = false
}
</script>

<template>
  <div class="game-center">
    <!-- 固定顶部按钮区域 -->
    <div class="fixed-header">
      <!-- 时间显示 -->
      <div class="datetime-container">
        <div class="date">{{ currentDate }}</div>
        <div class="time">{{ currentTime }}</div>
      </div>
      
      <!-- 功能按钮 -->
      <button class="manual-button" @click="openManual">游戏说明书</button>
      <button class="weather-button" @click="openWeather">查看天气</button>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 页面标题 -->
      <h1 class="page-title">我的游戏集合By Andy3re</h1>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <input 
          v-model="searchTerm"
          type="text" 
          class="search-box" 
          placeholder="搜索游戏..."
        >
      </div>
      
      <!-- 无结果提示 -->
      <div v-if="noResults" class="no-results">
        没有找到相关游戏
      </div>
      
      <!-- 游戏卡片容器 -->
      <div class="games-container">
        <div 
          v-for="game in filteredGames" 
          :key="game.id" 
          class="game-card"
        >
          <div :class="`game-image ${game.image}`"></div>
          <div class="game-content">
            <h2 class="game-title">{{ game.title }}</h2>
            <p class="game-description">{{ game.description }}</p>
            <NuxtLink 
              :to="game.link" 
              :class="`game-button ${game.color}`"
            >
              开始游戏
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="page-footer">
      <p>© 2025 游戏集合 - 尽情享受游戏的乐趣！</p>
    </footer>

    <!-- 游戏说明书模态框 -->
    <div v-if="showManual" class="modal" @click.self="closeManual">
      <div class="modal-content">
        <span class="close-button" @click="closeManual">&times;</span>
        <div class="manual-content">
          <h1>游戏集合项目</h1>
          <p>这是一个使用现代Web技术开发的网页游戏集合项目。</p>
          
          <h2>游戏列表</h2>
          <ul>
            <li><strong>扫雷游戏</strong> - 经典的逻辑推理游戏</li>
            <li><strong>坦克对战</strong> - 多人对战模式</li>
            <li><strong>飞机大战</strong> - 经典射击游戏</li>
            <li><strong>贪吃蛇</strong> - 经典成长类游戏</li>
            <li><strong>深海捕鱼</strong> - 休闲娱乐游戏</li>
            <li><strong>打字挑战</strong> - 提升打字速度</li>
          </ul>
          
          <h2>操作说明</h2>
          <p>每个游戏都有独特的操作方式，请在游戏中查看具体说明。</p>
        </div>
      </div>
    </div>

    <!-- 天气模态框 -->
    <div v-if="showWeather" class="weather-modal" @click.self="closeWeather">
      <div class="weather-content">
        <span class="weather-close" @click="closeWeather">&times;</span>
        <h2>当前天气</h2>
        <div class="weather-info">
          {{ weatherInfo }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-center {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

/* 固定头部区域 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.fixed-header > * {
  pointer-events: auto;
}

/* 时间显示 */
.datetime-container {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #4a90e2;
  border-radius: 20px;
  color: #4a90e2;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 200px;
  transition: all 0.3s ease;
}

.datetime-container:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.date {
  font-size: 14px;
  margin-bottom: 4px;
  color: #357abd;
}

.time {
  font-size: 18px;
  font-weight: bold;
  color: #4a90e2;
}

/* 功能按钮 */
.manual-button,
.weather-button {
  position: fixed;
  top: 20px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #4a90e2;
  border-radius: 20px;
  color: #4a90e2;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.manual-button {
  right: 280px;
}

.weather-button {
  right: 430px;
}

.manual-button:hover,
.weather-button:hover {
  background: #4a90e2;
  color: white;
}

/* 主要内容区域 */
.main-content {
  padding: 80px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #374151;
  text-align: center;
}

/* 搜索框 */
.search-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.search-box {
  width: 100%;
  padding: 12px 24px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid #4a90e2;
  border-radius: 30px;
  font-size: 16px;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-box:focus {
  outline: none;
  border-color: #357abd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.search-box::placeholder {
  color: #999;
}

.no-results {
  text-align: center;
  color: #666;
  margin: 20px 0;
  font-size: 18px;
}

/* 游戏卡片容器 */
.games-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1280px;
  margin: 0 auto;
  gap: 20px;
}

.game-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  width: 380px;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(245, 113, 113, 0.2);
}

.game-image {
  height: 240px;
  background-size: cover;
  background-position: center;
  background-color: #f3f4f6;
}

.game-image.minesweeper {
  background-image: linear-gradient(45deg, #ff6b6b, #feca57);
}

.game-image.tank {
  background-image: linear-gradient(45deg, #48dbfb, #0abde3);
}

.game-image.plane {
  background-image: linear-gradient(45deg, #ff9ff3, #f368e0);
}

.game-image.snake {
  background-image: linear-gradient(45deg, #feca57, #ff9f43);
}

.game-image.fishing {
  background-image: linear-gradient(45deg, #48dbfb, #0abde3);
}

.game-image.typing {
  background-image: linear-gradient(45deg, #a55eea, #778beb);
}

.game-content {
  padding: 1.5rem;
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.game-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.game-button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: center;
  color: white;
  font-weight: bold;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

/* 页脚 */
.page-footer {
  margin-top: 3rem;
  text-align: center;
  color: #666;
  padding: 2rem;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  position: relative;
  width: 80%;
  max-width: 800px;
  max-height: 80%;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #000;
}

.manual-content {
  line-height: 1.6;
}

.manual-content h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.manual-content h2 {
  color: #374151;
  margin: 1.5rem 0 0.5rem;
}

.manual-content ul {
  padding-left: 1.5rem;
}

.manual-content li {
  margin-bottom: 0.5rem;
}

/* 天气模态框 */
.weather-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-content {
  position: relative;
  width: 300px;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  text-align: center;
}

.weather-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.weather-close:hover {
  color: #000;
}

.weather-content h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1f2937;
}

.weather-info {
  margin: 1rem 0;
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-line;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .games-container {
    flex-direction: column;
    align-items: center;
  }
  
  .game-card {
    width: 90%;
    max-width: 400px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .fixed-header button {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .datetime-container {
    min-width: 150px;
    font-size: 12px;
  }
  
  .manual-button {
    right: 200px;
  }
  
  .weather-button {
    right: 320px;
  }
}
</style>
