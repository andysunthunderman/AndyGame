<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 响应式数据
const score = ref(0)
const timeLeft = ref(60)
const currentWord = ref('')
const userInput = ref('')
const gameRunning = ref(false)
const wpm = ref(0)
const accuracy = ref(100)
const totalWords = ref(0)
const correctWords = ref(0)
const gameMode = ref<'chinese' | 'english'>('chinese')

let timerInterval: NodeJS.Timeout | null = null

// 中文词汇库
const chineseWords = [
  '编程', '代码', '开发', '网站', '应用', '系统', '数据', '算法',
  '函数', '变量', '循环', '条件', '数组', '对象', '方法', '类',
  '继承', '封装', '多态', '接口', '模块', '组件', '框架', '库',
  '前端', '后端', '数据库', '服务器', '客户端', '响应式', '异步', '同步'
]

// 英文词汇库
const englishWords = [
  'program', 'code', 'develop', 'website', 'application', 'system', 'data', 'algorithm',
  'function', 'variable', 'loop', 'condition', 'array', 'object', 'method', 'class',
  'inheritance', 'encapsulation', 'polymorphism', 'interface', 'module', 'component', 'framework', 'library',
  'frontend', 'backend', 'database', 'server', 'client', 'responsive', 'async', 'sync',
  'javascript', 'typescript', 'python', 'java', 'html', 'css', 'react', 'vue',
  'angular', 'nodejs', 'express', 'mongodb', 'mysql', 'git', 'github', 'docker'
]

// 获取当前模式的词汇库
const getCurrentWords = (): string[] => {
  return gameMode.value === 'chinese' ? chineseWords : englishWords
}

// 生成新单词
const generateNewWord = () => {
  const words = getCurrentWords()
  if (words.length > 0) {
    const randomIndex = Math.floor(Math.random() * words.length)
    const selectedWord = words[randomIndex]
    if (selectedWord) {
      currentWord.value = selectedWord
    }
  }
}

// 切换游戏模式
const switchMode = (mode: 'chinese' | 'english') => {
  if (!gameRunning.value) {
    gameMode.value = mode
    generateNewWord()
  }
}

// 检查输入
const checkInput = () => {
  if (userInput.value === currentWord.value) {
    correctWords.value++
    score.value += currentWord.value.length * 10
    userInput.value = ''
    generateNewWord()
    updateStats()
  }
}

// 更新统计信息
const updateStats = () => {
  totalWords.value++
  accuracy.value = Math.round((correctWords.value / totalWords.value) * 100)
  const timeElapsed = (60 - timeLeft.value) / 60
  wpm.value = timeElapsed > 0 ? Math.round(correctWords.value / timeElapsed) : 0
}

// 开始游戏
const startGame = () => {
  score.value = 0
  timeLeft.value = 60
  totalWords.value = 0
  correctWords.value = 0
  accuracy.value = 100
  wpm.value = 0
  userInput.value = ''
  gameRunning.value = true
  
  generateNewWord()
  
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

// 结束游戏
const endGame = () => {
  gameRunning.value = false
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  // 记录成绩
  recordGameScore('Typing Challenge', score.value)
  
  const result = confirm(`Game Over!\nFinal Score: ${score.value}\nAccuracy: ${accuracy.value}%\nSpeed: ${wpm.value} WPM\n\nClick OK to restart, Cancel to return to homepage`)
  if (result) {
    startGame()
  } else {
    navigateTo('/')
  }
}

// 记录游戏成绩
const recordGameScore = (gameName: string, score: number) => {
  try {
    const today = new Date().toLocaleDateString('zh-CN')
    const now = new Date().toLocaleTimeString('zh-CN')
    const scores = JSON.parse(localStorage.getItem('gameScores') || '{}')
    
    if (!scores[today]) {
      scores[today] = {}
    }
    
    if (!scores[today][gameName]) {
      scores[today][gameName] = {
        highScore: score,
        playCount: 1,
        lastPlayed: now
      }
    } else {
      const gameData = scores[today][gameName]
      gameData.playCount += 1
      gameData.lastPlayed = now
      if (score > gameData.highScore) {
        gameData.highScore = score
      }
    }
    
    localStorage.setItem('gameScores', JSON.stringify(scores))
  } catch (error) {
    console.error('保存成绩失败:', error)
  }
}

// 处理键盘输入
const handleKeyPress = (event: KeyboardEvent) => {
  if (!gameRunning.value) return
  
  if (event.key === 'Enter') {
    if (userInput.value === currentWord.value) {
      correctWords.value++
      score.value += currentWord.value.length * 10
      userInput.value = ''
      generateNewWord()
      updateStats()
    } else {
      totalWords.value++
      userInput.value = ''
      updateStats()
    }
  }
}

onMounted(() => {
  if (process.client) {
    document.addEventListener('keypress', handleKeyPress)
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (process.client) {
    document.removeEventListener('keypress', handleKeyPress)
  }
})
</script>

<template>
  <div class="typing-game">


    <div class="game-container">
      <h1 class="game-title">Typing Challenge</h1>
      
      <!-- 模式选择 -->
      <div class="mode-selector" v-if="!gameRunning">
        <div class="mode-buttons">
          <button 
            class="mode-button" 
            :class="{ active: gameMode === 'chinese' }"
            @click="switchMode('chinese')"
          >
            Chinese Mode
          </button>
          <button 
            class="mode-button" 
            :class="{ active: gameMode === 'english' }"
            @click="switchMode('english')"
          >
            English Mode
          </button>
        </div>
      </div>
      
      <!-- 当前模式显示 -->
      <div class="current-mode" v-if="gameRunning">
        <span class="mode-indicator">Current Mode: {{ gameMode === 'chinese' ? 'Chinese' : 'English' }}</span>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">Score:</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Time:</span>
          <span class="stat-value">{{ timeLeft }}s</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Speed:</span>
          <span class="stat-value">{{ wpm }} WPM</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Accuracy:</span>
          <span class="stat-value">{{ accuracy }}%</span>
        </div>
      </div>
      
      <!-- 游戏区域 -->
      <div class="game-area" v-if="gameRunning">
        <div class="word-display">
          <span class="current-word">{{ currentWord }}</span>
        </div>
        
        <div class="input-area">
          <input
            v-model="userInput"
            type="text"
            class="word-input"
            :placeholder="`Type '${currentWord}' and press Enter`"
            autofocus
          >
        </div>
      </div>
      
      <!-- 开始按钮 -->
      <div class="controls" v-else>
        <button class="start-button" @click="startGame">
          {{ timeLeft === 60 ? 'Start Game' : 'Restart' }}
        </button>
      </div>
      
      <!-- 游戏说明 -->
      <div class="instructions">
        <h3>Instructions</h3>
        <ul>
          <li>Select Chinese or English typing mode</li>
          <li>Type the displayed word in the input box</li>
          <li>Press Enter after typing to confirm</li>
          <li>Correct typing earns points, incorrect typing earns no points</li>
          <li>Challenge your typing speed and accuracy!</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}



.game-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.game-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.mode-selector {
  margin-bottom: 2rem;
}

.mode-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.mode-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  border: 2px solid #667eea;
  border-radius: 0.5rem;
  background: white;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.mode-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.current-mode {
  margin-bottom: 1rem;
}

.mode-indicator {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #e7f3ff;
  color: #667eea;
  border-radius: 0.5rem;
  font-weight: bold;
  font-size: 0.875rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.game-area {
  margin: 2rem 0;
}

.word-display {
  margin-bottom: 2rem;
}

.current-word {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  padding: 1rem 2rem;
  background: #f0f4ff;
  border-radius: 0.5rem;
  display: inline-block;
  min-width: 200px;
}

.input-area {
  margin-top: 1rem;
}

.word-input {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
  font-size: 1.25rem;
  border: 2px solid #667eea;
  border-radius: 0.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.word-input:focus {
  outline: none;
  border-color: #5a67d8;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.controls {
  margin: 2rem 0;
}

.start-button {
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.instructions {
  margin-top: 2rem;
  text-align: left;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.instructions h3 {
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.instructions ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  color: #666;
}

.instructions li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .typing-game {
    padding: 1rem;
  }
  
  .game-container {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 2rem;
  }
  
  .current-word {
    font-size: 2rem;
    padding: 0.75rem 1rem;
    min-width: 150px;
  }
  
  .word-input {
    font-size: 1rem;
    padding: 0.75rem;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .start-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
  
  .mode-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .mode-button {
    width: 100%;
    max-width: 200px;
  }
  

}
</style> 