<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

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
const currentLanguage = ref('en') // 默认语言为英文
const showLanguageMenu = ref(false)
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
    id: 'bottle',
    title: '漂流瓶',
    description: '向大海抛出你的心情，或许会收到意想不到的回应！',
    link: '/games/bottle',
    color: 'bg-teal-500 hover:bg-teal-600',
    image: 'bottle'
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
  },
  {
    id: 'tank',
    title: '多人坦克对战',
    description: '控制你的坦克，在战场上与其他玩家对战！（开发中）',
    link: '/games/tank',
    color: 'bg-green-500 hover:bg-green-600',
    image: 'tank'
  },
  {
    id: 'plane',
    title: '飞机大战',
    description: '控制你的飞机，躲避敌人的攻击并击落敌机！（开发中）',
    link: '/games/plane',
    color: 'bg-purple-500 hover:bg-purple-600',
    image: 'plane'
  }
])

// 过滤游戏函数
const filterGames = () => {
  if (!searchTerm.value) {
    noResults.value = false
    return games.value
  }
  
  const searchTermLower = searchTerm.value.toLowerCase()
  
  const filtered = games.value.filter(game => {
    // 获取当前语言下的游戏标题和描述
    const title = getGameTitle(game).toLowerCase()
    const description = getGameDesc(game).toLowerCase()
    
    // 在当前语言下的标题和描述中搜索
    return title.includes(searchTermLower) || description.includes(searchTermLower)
  })
  
  noResults.value = filtered.length === 0
  return filtered
}

// 计算属性：过滤后的游戏
const filteredGames = computed(() => filterGames())

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
  
  // 根据当前语言设置日期时间格式
  let locale = 'en-US' // 默认英文
  if (currentLanguage.value === 'zh') {
    locale = 'zh-CN'
  } else if (currentLanguage.value === 'es') {
    locale = 'es-ES'
  }
  
  currentDate.value = now.toLocaleDateString(locale, options)
  currentTime.value = now.toLocaleTimeString(locale, timeOptions)
}

// 获取天气信息
const getWeather = async () => {
  try {
    // 使用模拟天气数据代替API调用，避免ECONNRESET错误
    // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Beijing&appid=YOUR_API_KEY&units=metric&lang=zh_cn')
    // if (response.ok) {
    //   const data = await response.json()
    //   weatherInfo.value = `城市: ${data.name}\\n温度: ${data.main.temp}°C\\n天气: ${data.weather[0].description}\\n湿度: ${data.main.humidity}%`
    // } else {
    //   weatherInfo.value = '无法获取天气信息，请稍后再试'
    // }
    
    // 使用模拟数据
    const mockData = {
      name: '武汉',
      main: { temp: 25, humidity: 60 },
      weather: [{ description: '晴朗' }]
    }
    
    let weatherText = ''
    
    if (currentLanguage.value === 'zh') {
      weatherText = `城市: ${mockData.name}\\n温度: ${mockData.main.temp}°C\\n天气: ${mockData.weather[0]?.description || ''}\\n湿度: ${mockData.main.humidity}%`
    } else if (currentLanguage.value === 'en') {
      weatherText = `City: ${mockData.name}\\nTemperature: ${mockData.main.temp}°C\\nWeather: Clear\\nHumidity: ${mockData.main.humidity}%`
    } else {
      weatherText = `Ciudad: ${mockData.name}\\nTemperatura: ${mockData.main.temp}°C\\nClima: Despejado\\nHumedad: ${mockData.main.humidity}%`
    }
    
    weatherInfo.value = weatherText
  } catch {
    if (currentLanguage.value === 'zh') {
      weatherInfo.value = '天气服务暂时不可用'
    } else if (currentLanguage.value === 'en') {
      weatherInfo.value = 'Weather service is temporarily unavailable'
    } else {
      weatherInfo.value = 'El servicio meteorológico no está disponible temporalmente'
    }
  }
}

// 监听语言变化，更新日期时间显示
watch(currentLanguage, () => {
  updateDateTime()
})

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

// 语言相关方法
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const changeLanguage = (lang: string) => {
  currentLanguage.value = lang
  // 切换语言后不关闭菜单，方便用户继续切换其他语言选项
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.error('图片加载失败:', img.src)
  // 隐藏图片并显示渐变背景
  img.style.display = 'none'
  const container = img.parentElement!
  
  // 根据游戏类型设置不同的渐变背景
  const gameId = img.alt?.toLowerCase()
  let gradient = 'linear-gradient(45deg, #667eea, #764ba2)' // 默认渐变
  
  switch(gameId) {
    case '扫雷游戏':
      gradient = 'linear-gradient(45deg, #4facfe, #00f2fe)'
      break
    case '贪吃蛇':
      gradient = 'linear-gradient(45deg, #fa709a, #fee140)'
      break
    case '深海捕鱼':
      gradient = 'linear-gradient(45deg, #43e97b, #38f9d7)'
      break
    case '打字挑战':
      gradient = 'linear-gradient(45deg, #667eea, #764ba2)'
      break
    case '多人坦克对战':
      gradient = 'linear-gradient(45deg, #a8edea, #fed6e3)'
      break
    case '飞机大战':
      gradient = 'linear-gradient(45deg, #ff9a9e, #fecfef)'
      break
  }
  
  container.style.background = gradient
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.justifyContent = 'center'
  
  // 添加游戏图标或文字
  const icon = document.createElement('div')
  icon.style.fontSize = '48px'
  icon.style.color = 'rgba(255, 255, 255, 0.8)'
  icon.style.fontWeight = 'bold'
  icon.textContent = getGameIcon(gameId || '')
  container.appendChild(icon)
}

// 获取游戏图标
const getGameIcon = (gameTitle: string) => {
  switch(gameTitle) {
    case '扫雷游戏':
      return '💣'
    case '贪吃蛇':
      return '🐍'
    case '深海捕鱼':
      return '🎣'
    case '打字挑战':
      return '⌨️'
    case '多人坦克对战':
      return '🚗'
    case '飞机大战':
      return '✈️'
    case '漂流瓶':
      return '🍾'
    default:
      return '🎮'
  }
}

// 图片加载成功处理
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log('图片加载成功:', img.src)
}

// 定义游戏类型接口
interface GameItem {
  id: string;
  title: string;
  description: string;
  link: string;
  color: string;
  image: string;
}

// 获取游戏在当前语言下的标题
const getGameTitle = (game: GameItem) => {
  if (currentLanguage.value === 'zh') {
    return game.title
  } else if (currentLanguage.value === 'en') {
    // 英文标题
    const enTitles: Record<string, string> = {
      minesweeper: 'Minesweeper',
      snake: 'Snake',
      fishing: 'Deep Sea Fishing',
      typing: 'Typing Challenge',
      tank: 'Multiplayer Tank Battle',
      plane: 'Aircraft Battle',
      bottle: 'Message in a Bottle'
    }
    return enTitles[game.id] || game.title
  } else {
    // 西班牙语标题
    const esTitles: Record<string, string> = {
      minesweeper: 'Buscaminas',
      snake: 'Serpiente',
      fishing: 'Pesca en Alta Mar',
      typing: 'Desafío de Mecanografía',
      tank: 'Batalla de Tanques Multijugador',
      plane: 'Batalla de Aviones',
      bottle: 'Botella al Mar'
    }
    return esTitles[game.id] || game.title
  }
}

// 获取游戏在当前语言下的描述
const getGameDesc = (game: GameItem) => {
  if (currentLanguage.value === 'zh') {
    return game.description
  } else if (currentLanguage.value === 'en') {
    // 英文描述
    const enDesc: Record<string, string> = {
      minesweeper: 'Classic logic puzzle game that tests your logical thinking and luck!',
      snake: 'Classic growth game, control the snake to eat food and grow!',
      fishing: 'Experience exciting deep-sea fishing and collect various rare fish!',
      typing: 'Improve your typing speed and accuracy, challenge yourself!',
      tank: 'Control your tank and battle with other players on the battlefield! (In development)',
      plane: 'Control your aircraft, avoid enemy attacks and shoot down enemy planes! (In development)',
      bottle: 'Share your thoughts with the sea, and maybe receive unexpected responses!'
    }
    return enDesc[game.id] || game.description
  } else {
    // 西班牙语描述
    const esDesc: Record<string, string> = {
      minesweeper: '¡Juego clásico de lógica que pone a prueba tu pensamiento lógico y suerte!',
      snake: '¡Juego clásico de crecimiento, controla la serpiente para comer alimentos y crecer!',
      fishing: '¡Experimenta la emocionante pesca en alta mar y colecciona varios peces raros!',
      typing: '¡Mejora tu velocidad y precisión de escritura, desafíate a ti mismo!',
      tank: '¡Controla tu tanque y lucha con otros jugadores en el campo de batalla! (En desarrollo)',
      plane: '¡Controla tu avión, evita los ataques enemigos y derriba aviones enemigos! (En desarrollo)',
      bottle: '¡Comparte tus pensamientos con el mar y quizás recibas respuestas inesperadas!'
    }
    return esDesc[game.id] || game.description
  }
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
      <button class="manual-button" @click="openManual">
        {{ currentLanguage === 'zh' ? '游戏说明书' : 
           (currentLanguage === 'en' ? 'Game Manual' : 'Manual del Juego') }}
      </button>
      <button class="weather-button" @click="openWeather">
        {{ currentLanguage === 'zh' ? '查看天气' :
           (currentLanguage === 'en' ? 'Check Weather' : 'Ver el Clima') }}
      </button>
      
      <!-- 语言切换按钮 -->
      <div class="language-selector">
        <div class="language-button-container">
          <button class="language-button" @click="toggleLanguageMenu">
            {{ currentLanguage === 'zh' ? '语言' :
               (currentLanguage === 'en' ? 'Language' : 'Idioma') }}
            <span class="current-lang">{{ currentLanguage.toUpperCase() }}</span>
          </button>
          
          <!-- 显示可选语言提示 -->
          <div v-if="!showLanguageMenu" class="language-tooltip">
            <div class="language-options-preview">
              <span>
                <span :class="{'tooltip-active': currentLanguage === 'zh'}">中</span> / 
                <span :class="{'tooltip-active': currentLanguage === 'en'}">EN</span> / 
                <span :class="{'tooltip-active': currentLanguage === 'es'}">ES</span>
              </span>
            </div>
            <div class="tooltip-arrow"/>
          </div>
        </div>
        
        <div v-if="showLanguageMenu" class="language-menu">
          <button 
            class="language-option" 
            :class="{
              'active': currentLanguage === 'zh',
              'unselected': currentLanguage !== 'zh'
            }"
            @click="changeLanguage('zh')"
          >
            {{ currentLanguage === 'zh' ? '中文' :
               (currentLanguage === 'en' ? 'Chinese' : 'Chino') }}
          </button>
          <button 
            class="language-option" 
            :class="{
              'active': currentLanguage === 'en',
              'unselected': currentLanguage !== 'en'
            }"
            @click="changeLanguage('en')"
          >
            {{ currentLanguage === 'zh' ? '英文' :
               (currentLanguage === 'en' ? 'English' : 'Inglés') }}
          </button>
          <button 
            class="language-option" 
            :class="{
              'active': currentLanguage === 'es',
              'unselected': currentLanguage !== 'es'
            }"
            @click="changeLanguage('es')"
          >
            {{ currentLanguage === 'zh' ? '西班牙语' :
               (currentLanguage === 'en' ? 'Spanish' : 'Español') }}
          </button>
          
          <!-- 关闭按钮 -->
          <button class="close-language-menu" @click="showLanguageMenu = false">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 页面标题 -->
      <h1 class="page-title">{{ currentLanguage === 'zh' ? '我的游戏集合By Andy3re' : 
         (currentLanguage === 'en' ? 'My Game Collection By Andy3re' : 'Mi Colección de Juegos Por Andy3re') }}</h1>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <input 
          v-model="searchTerm"
          type="text" 
          class="search-box" 
          :placeholder="currentLanguage === 'zh' ? '搜索游戏...' : 
            (currentLanguage === 'en' ? 'Search games...' : 'Buscar juegos...')"
        >
      </div>
      
      <!-- 无结果提示 -->
      <div v-if="noResults" class="no-results">
        {{ currentLanguage === 'zh' ? '没有找到相关游戏' :
           (currentLanguage === 'en' ? 'No games found' : 'No se encontraron juegos') }}
      </div>
      
      <!-- 游戏卡片容器 -->
      <div class="games-container">
        <div 
          v-for="game in filteredGames" 
          :key="game.id" 
          class="game-card"
        >
          <div class="game-image-container">
            <img 
              :src="`/images/${game.image}.png`" 
              :alt="game.title"
              class="game-image"
              @error="handleImageError"
              @load="handleImageLoad"
            >
          </div>
          <div class="game-content">
            <h2 class="game-title">{{ getGameTitle(game) }}</h2>
            <p class="game-description">{{ getGameDesc(game) }}</p>
            <NuxtLink 
              :to="game.link" 
              :class="`game-button ${game.color}`"
            >
              {{ currentLanguage === 'zh' ? '开始游戏' :
                 (currentLanguage === 'en' ? 'Start Game' : 'Iniciar Juego') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏说明书模态框 -->
    <div v-if="showManual" class="modal" @click.self="closeManual">
      <div class="modal-content">
        <span class="close-button" @click="closeManual">&times;</span>
        <div class="manual-content">
          <h1>{{ currentLanguage === 'zh' ? '游戏集合项目' : 
             (currentLanguage === 'en' ? 'Game Collection Project' : 'Proyecto de Colección de Juegos') }}</h1>
          <p>{{ currentLanguage === 'zh' ? '这是一个使用现代Web技术开发的网页游戏集合项目。' : 
             (currentLanguage === 'en' ? 'This is a web game collection project developed with modern Web technologies.' :
             'Este es un proyecto de colección de juegos web desarrollado con tecnologías Web modernas.') }}</p>
          
          <h2>{{ currentLanguage === 'zh' ? '游戏列表' : 
             (currentLanguage === 'en' ? 'Game List' : 'Lista de Juegos') }}</h2>
          <ul>
            <li><strong>{{ currentLanguage === 'zh' ? '扫雷游戏' : 
                (currentLanguage === 'en' ? 'Minesweeper' : 'Buscaminas') }}</strong> - 
                {{ currentLanguage === 'zh' ? '经典的逻辑推理游戏' : 
                (currentLanguage === 'en' ? 'Classic logic puzzle game' : 'Juego clásico de lógica') }}</li>
            <li><strong>{{ currentLanguage === 'zh' ? '坦克对战' : 
                (currentLanguage === 'en' ? 'Tank Battle' : 'Batalla de Tanques') }}</strong> - 
                {{ currentLanguage === 'zh' ? '多人对战模式' : 
                (currentLanguage === 'en' ? 'Multiplayer battle mode' : 'Modo de batalla multijugador') }}</li>
            <li><strong>{{ currentLanguage === 'zh' ? '飞机大战' : 
                (currentLanguage === 'en' ? 'Aircraft Battle' : 'Batalla de Aviones') }}</strong> - 
                {{ currentLanguage === 'zh' ? '经典射击游戏' : 
                (currentLanguage === 'en' ? 'Classic shooting game' : 'Juego clásico de disparos') }}</li>
            <li><strong>{{ currentLanguage === 'zh' ? '贪吃蛇' : 
                (currentLanguage === 'en' ? 'Snake' : 'Serpiente') }}</strong> - 
                {{ currentLanguage === 'zh' ? '经典成长类游戏' : 
                (currentLanguage === 'en' ? 'Classic growth game' : 'Juego clásico de crecimiento') }}</li>
            <li><strong>{{ currentLanguage === 'zh' ? '深海捕鱼' : 
                (currentLanguage === 'en' ? 'Deep Sea Fishing' : 'Pesca en Alta Mar') }}</strong> - 
                {{ currentLanguage === 'zh' ? '休闲娱乐游戏' : 
                (currentLanguage === 'en' ? 'Casual entertainment game' : 'Juego de entretenimiento casual') }}</li>
            <li><strong>{{ currentLanguage === 'zh' ? '打字挑战' : 
                (currentLanguage === 'en' ? 'Typing Challenge' : 'Desafío de Mecanografía') }}</strong> - 
                {{ currentLanguage === 'zh' ? '提升打字速度' : 
                (currentLanguage === 'en' ? 'Improve typing speed' : 'Mejorar la velocidad de escritura') }}</li>
          </ul>
          
          <h2>{{ currentLanguage === 'zh' ? '操作说明' : 
             (currentLanguage === 'en' ? 'Operation Guide' : 'Guía de Operación') }}</h2>
          <p>{{ currentLanguage === 'zh' ? '每个游戏都有独特的操作方式，请在游戏中查看具体说明。' : 
             (currentLanguage === 'en' ? 'Each game has unique operation methods, please check the specific instructions in the game.' :
             'Cada juego tiene métodos de operación únicos, consulte las instrucciones específicas en el juego.') }}</p>
        </div>
      </div>
    </div>

    <!-- 天气模态框 -->
    <div v-if="showWeather" class="weather-modal" @click.self="closeWeather">
      <div class="weather-content">
        <span class="weather-close" @click="closeWeather">&times;</span>
        <h2>{{ currentLanguage === 'zh' ? '当前天气' : 
           (currentLanguage === 'en' ? 'Current Weather' : 'Clima Actual') }}</h2>
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

/* 语言选择器 */
.language-selector {
  position: fixed;
  top: 20px;
  left: 20px;
}

.language-button {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #4a90e2;
  border-radius: 20px;
  color: #4a90e2;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.language-button:hover {
  background: #4a90e2;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.language-button:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: 0;
  left: 0;
  background-color: #388e3c;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s;
}

.language-button:hover:after {
  transform-origin: bottom left;
  transform: scaleX(1);
}

.current-lang {
  margin-left: 8px;
  padding: 2px 6px;
  background: #4a90e2;
  color: white;
  border-radius: 10px;
  font-size: 12px;
}

.language-menu {
  position: absolute;
  top: 45px;
  left: 0;
  width: 150px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1001;
}

.language-option {
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-option:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.language-option.active {
  background: #e6f3ff;
  color: #4a90e2;
  font-weight: bold;
  border-left: 3px solid #4a90e2;
}

.language-option.unselected {
  background: #e8f5e9;
  color: #388e3c;
  transition: all 0.3s ease;
}

/* 语言按钮容器 */
.language-button-container {
  position: relative;
}

/* 语言选择提示 */
.language-tooltip {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1001;
}

.language-button-container:hover .language-tooltip {
  opacity: 1;
}

.tooltip-arrow {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(0, 0, 0, 0.7);
}

.language-options-preview {
  text-align: center;
}

.tooltip-active {
  font-weight: bold;
  color: #4a90e2;
  text-decoration: underline;
}

/* 关闭语言菜单按钮 */
.close-language-menu {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-language-menu:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
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

.game-image-container {
  height: 240px;
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
  
  .language-selector {
    top: 60px;
  }
  
  .language-tooltip {
    top: -35px;
    font-size: 10px;
    padding: 3px 8px;
  }
}
</style>
