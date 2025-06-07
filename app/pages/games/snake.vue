<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 游戏配置
const GRID_SIZE = 20
const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 400

// 响应式数据
const score = ref(0)
const gameInterval = ref<NodeJS.Timeout | null>(null)
const isPaused = ref(false)
const gameRunning = ref(false)

// 游戏状态
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let snake = [{ x: 10, y: 10 }]
let food = { x: 15, y: 15 }
let dx = 0
let dy = 0
const tileCount = CANVAS_WIDTH / GRID_SIZE

// 初始化游戏
const initGame = () => {
  if (process.client) {
    canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (canvas) {
      ctx = canvas.getContext('2d')
    }
  }
}

// 绘制游戏
const drawGame = () => {
  if (!ctx || !canvas) return

  // 清空画布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 绘制网格线
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 1
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath()
    ctx.moveTo(i * GRID_SIZE, 0)
    ctx.lineTo(i * GRID_SIZE, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * GRID_SIZE)
    ctx.lineTo(canvas.width, i * GRID_SIZE)
    ctx.stroke()
  }
  
  // 确保蛇存在且不为空
  if (!snake || snake.length === 0) {
    snake = [{ x: 10, y: 10 }]
  }
  
  // 移动蛇
  const head = { x: snake[0].x + dx, y: snake[0].y + dy }
  snake.unshift(head)
  
  // 检查是否吃到食物
  if (head.x === food.x && head.y === food.y) {
    score.value += 10
    generateFood()
  } else {
    snake.pop()
  }
  
  // 检查游戏结束条件
  if (isGameOver()) {
    gameOver()
    return
  }
  
  // 绘制食物
  ctx.fillStyle = 'red'
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2)
  
  // 绘制蛇
  snake.forEach((segment, index) => {
    if (index === 0) {
      // 蛇头用深绿色
      ctx!.fillStyle = '#006400'
    } else {
      // 蛇身用浅绿色
      ctx!.fillStyle = '#32CD32'
    }
    ctx!.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2)
  })
}

// 生成食物
const generateFood = () => {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  }
  // 确保食物不会生成在蛇身上
  if (snake && snake.length > 0) {
    while (snake.some(segment => segment && segment.x === food.x && segment.y === food.y)) {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      }
    }
  }
}

// 检查游戏结束
const isGameOver = () => {
  // 确保蛇存在且不为空
  if (!snake || snake.length === 0) {
    return true
  }
  
  // 撞墙
  if (snake[0].x < 0 || snake[0].x >= tileCount || 
      snake[0].y < 0 || snake[0].y >= tileCount) {
    return true
  }
  
  // 撞到自己
  for (let i = 1; i < snake.length; i++) {
    if (snake[i] && snake[0] && snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true
    }
  }
  
  return false
}

// 游戏结束
const gameOver = () => {
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
    gameInterval.value = null
  }
  gameRunning.value = false
  
  // 记录成绩
  recordGameScore('贪吃蛇', score.value)
  
  const result = confirm(`游戏结束！\n最终得分：${score.value}\n\n点击确定重新开始，取消返回主页`)
  if (result) {
    startGame()
  } else {
    navigateTo('/')
  }
}

// 开始游戏
const startGame = () => {
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
  }
  
  // 重置游戏状态
  snake = [{ x: 10, y: 10 }]
  dx = 0
  dy = 0
  score.value = 0
  isPaused.value = false
  gameRunning.value = true
  
  generateFood()
  gameInterval.value = setInterval(drawGame, 100)
}

// 暂停游戏
const pauseGame = () => {
  if (isPaused.value) {
    gameInterval.value = setInterval(drawGame, 100)
    isPaused.value = false
  } else {
    if (gameInterval.value) {
      clearInterval(gameInterval.value)
      gameInterval.value = null
    }
    isPaused.value = true
  }
}

// 键盘控制
const handleKeydown = (event: KeyboardEvent) => {
  if (!gameRunning.value || isPaused.value) return
  
  switch (event.key) {
    case 'ArrowUp':
      if (dy !== 1) { // 防止向下时向上移动
        dx = 0
        dy = -1
      }
      break
    case 'ArrowDown':
      if (dy !== -1) { // 防止向上时向下移动
        dx = 0
        dy = 1
      }
      break
    case 'ArrowLeft':
      if (dx !== 1) { // 防止向右时向左移动
        dx = -1
        dy = 0
      }
      break
    case 'ArrowRight':
      if (dx !== -1) { // 防止向左时向右移动
        dx = 1
        dy = 0
      }
      break
  }
  event.preventDefault()
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

onMounted(() => {
  initGame()
  // 添加键盘事件监听
  if (process.client) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
  }
  if (process.client) {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div class="snake-game">


    <div class="game-container">
      <h1 class="game-title">贪吃蛇游戏</h1>
      
      <div class="score-display">
        分数: <span class="score-value">{{ score }}</span>
      </div>
      
      <canvas 
        id="gameCanvas" 
        :width="CANVAS_WIDTH" 
        :height="CANVAS_HEIGHT"
        class="game-canvas"
      ></canvas>
      
      <div class="controls">
        <button 
          class="control-button start-button" 
          @click="startGame"
        >
          {{ gameRunning ? '重新开始' : '开始游戏' }}
        </button>
        <button 
          class="control-button pause-button" 
          @click="pauseGame"
          :disabled="!gameRunning"
        >
          {{ isPaused ? '继续' : '暂停' }}
        </button>
      </div>
      
      <div class="instructions">
        <p>使用方向键控制蛇的移动</p>
        <div class="arrow-keys">
          <div class="arrow-row">
            <div class="arrow-key">↑</div>
          </div>
          <div class="arrow-row">
            <div class="arrow-key">←</div>
            <div class="arrow-key">↓</div>
            <div class="arrow-key">→</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.snake-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}



.game-container {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.game-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.score-display {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
  color: #333;
}

.score-value {
  color: #4CAF50;
}

.game-canvas {
  border: 2px solid #333;
  border-radius: 4px;
  background-color: #fff;
  margin: 1rem 0;
  display: block;
}

.controls {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  color: white;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-button {
  background-color: #4CAF50;
}

.start-button:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
}

.pause-button {
  background-color: #ff9800;
}

.pause-button:hover:not(:disabled) {
  background-color: #e68900;
  transform: translateY(-2px);
}

.instructions {
  margin-top: 1.5rem;
  color: #666;
}

.instructions p {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.arrow-keys {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.arrow-row {
  display: flex;
  gap: 0.5rem;
}

.arrow-key {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .snake-game {
    padding: 1rem;
  }
  
  .game-container {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
  
  .game-canvas {
    max-width: 100%;
    height: auto;
  }
  
  .controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .control-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .arrow-key {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  

}
</style> 