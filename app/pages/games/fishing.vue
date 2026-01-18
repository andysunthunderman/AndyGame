<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 响应式数据
const score = ref(0)
const timeLeft = ref(60)
const gameRunning = ref(false)

// 游戏对象
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let fishingDevice: any = null
let fishes: any[] = []
let gameLoopId: number | null = null
let timerInterval: NodeJS.Timeout | null = null

// 捕鱼器类
class FishingDevice {
  width: number
  height: number
  x: number
  y: number
  lineLength: number
  maxLineLength: number
  isExtending: boolean
  lineSpeed: number

  constructor(canvasWidth: number, canvasHeight: number) {
    this.width = 100
    this.height = 60
    this.x = canvasWidth / 2
    this.y = canvasHeight - this.height
    this.lineLength = 0
    this.maxLineLength = canvasHeight - this.height
    this.isExtending = false
    this.lineSpeed = 5
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 绘制捕鱼器主体
    ctx.fillStyle = '#444'
    ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height)
    
    // 绘制捕鱼线
    if (this.lineLength > 0) {
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x, this.y - this.lineLength)
      ctx.stroke()

      // 绘制钩子
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(this.x, this.y - this.lineLength, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  update() {
    // 更新捕鱼线长度
    if (this.isExtending) {
      this.lineLength = Math.min(this.lineLength + this.lineSpeed, this.maxLineLength)
    } else {
      this.lineLength = Math.max(this.lineLength - this.lineSpeed, 0)
    }
  }

  updatePosition(canvasWidth: number, canvasHeight: number) {
    this.y = canvasHeight - this.height
    this.maxLineLength = canvasHeight - this.height
  }
}

// 鱼类
class Fish {
  x: number
  y: number
  size: number
  speed: number
  canvasWidth: number
  canvasHeight: number

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.size = Math.random() * 30 + 20
    this.speed = Math.random() * 3 + 1
    this.reset()
  }

  reset() {
    this.x = this.canvasWidth + 50
    this.y = Math.random() * (this.canvasHeight - 150) + 50
  }

  update() {
    this.x -= this.speed
    if (this.x < -50) {
      this.reset()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.ellipse(this.x, this.y, this.size, this.size/2, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 鱼鳍
    ctx.fillStyle = '#FFA500'
    ctx.beginPath()
    ctx.moveTo(this.x - this.size/2, this.y)
    ctx.lineTo(this.x - this.size, this.y - this.size/2)
    ctx.lineTo(this.x - this.size, this.y + this.size/2)
    ctx.fill()
  }

  checkCatch(fishingDevice: FishingDevice) {
    const hookX = fishingDevice.x
    const hookY = fishingDevice.y - fishingDevice.lineLength
    
    const distance = Math.sqrt(
      Math.pow(hookX - this.x, 2) + 
      Math.pow(hookY - this.y, 2)
    )
    
    return distance < this.size
  }
}

// 初始化游戏
const initGame = () => {
  if (process.client) {
    canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (canvas) {
      ctx = canvas.getContext('2d')
      resizeCanvas()
      
      fishingDevice = new FishingDevice(canvas.width, canvas.height)
      fishes = Array(5).fill(null).map(() => new Fish(canvas.width, canvas.height))
      
      // 添加事件监听
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('resize', resizeCanvas)
    }
  }
}

// 调整画布尺寸
const resizeCanvas = () => {
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // 更新游戏对象尺寸
    if (fishingDevice) {
      fishingDevice.updatePosition(canvas.width, canvas.height)
    }
    if (fishes.length > 0) {
      fishes.forEach(fish => {
        fish.canvasWidth = canvas.width
        fish.canvasHeight = canvas.height
      })
    }
  }
}

// 鼠标事件处理
const handleMouseMove = (e: MouseEvent) => {
  if (fishingDevice && canvas) {
    const mouseX = e.clientX
    fishingDevice.x = Math.max(fishingDevice.width/2, 
      Math.min(canvas.width - fishingDevice.width/2, mouseX))
  }
}

const handleMouseDown = () => {
  if (fishingDevice) {
    fishingDevice.isExtending = true
  }
}

const handleMouseUp = () => {
  if (fishingDevice) {
    fishingDevice.isExtending = false
  }
}

// 游戏循环
const gameLoop = () => {
  if (!ctx || !canvas || !gameRunning.value) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 更新和绘制捕鱼器
  if (fishingDevice) {
    fishingDevice.update()
    fishingDevice.draw(ctx)
  }

  // 更新和绘制鱼
  fishes.forEach(fish => {
    fish.update()
    fish.draw(ctx)
    
    // 检查是否捕获到鱼
    if (fishingDevice && fishingDevice.lineLength > 0 && fish.checkCatch(fishingDevice)) {
      score.value += Math.floor(fish.size)
      fish.reset()
    }
  })

  gameLoopId = requestAnimationFrame(gameLoop)
}

// 开始游戏
const startGame = () => {
  score.value = 0
  timeLeft.value = 60
  gameRunning.value = true
  
  // 开始游戏循环
  gameLoop()
  
  // 开始倒计时
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
  
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
    gameLoopId = null
  }
  
  // 记录成绩
  recordGameScore('Deep Sea Fishing', score.value)
  
  const result = confirm(`Game Over!\nFinal Score: ${score.value}\n\nClick OK to restart, Cancel to return to homepage`)
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

onMounted(() => {
  initGame()
  startGame()
})

onUnmounted(() => {
  gameRunning.value = false
  
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
  
  if (process.client && canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('resize', resizeCanvas)
  }
})
</script>

<template>
  <div class="fishing-game">
    <!-- 游戏画布 -->
    <canvas id="gameCanvas" class="game-canvas"></canvas>
    
    <!-- 游戏UI -->
    <div class="game-ui">
      <div class="score-display">Score: {{ score }}</div>
      <div class="timer-display">Time: {{ timeLeft }}s</div>
    </div>
    

    
    <!-- 游戏说明 -->
    <div class="instructions">
      <p>Move mouse to control fishing device position</p>
      <p>Hold left mouse button to extend fishing line</p>
      <p>Release left mouse button to retract fishing line</p>
      <p>Catch fish to earn points!</p>
    </div>
  </div>
</template>

<style scoped>
.fishing-game {
  margin: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  width: 100vw;
  height: 100vh;
}

.game-canvas {
  display: block;
  cursor: none;
}

.game-ui {
  position: fixed;
  top: 20px;
  left: 20px;
  color: white;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.score-display,
.timer-display {
  margin-bottom: 10px;
  font-weight: bold;
}



.instructions {
  position: fixed;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.instructions p {
  margin: 5px 0;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 10px;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-ui {
    font-size: 18px;
  }
  
  .instructions {
    font-size: 14px;
    bottom: 10px;
    left: 10px;
  }
  
  .instructions p {
    padding: 3px 6px;
  }
  

}
</style> 