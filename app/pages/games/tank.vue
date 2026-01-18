<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 响应式数据
const gameCanvas = ref<HTMLCanvasElement>()
const hitSound1 = ref<HTMLAudioElement>()
const hitSound2 = ref<HTMLAudioElement>()
const hitSound3 = ref<HTMLAudioElement>()
const hitSound4 = ref<HTMLAudioElement>()

const showPlayerSelect = ref(true)
const isPaused = ref(false)
const victoryMessage = ref('')
const victoryColor = ref('#fff')

// 游戏状态
let ctx: CanvasRenderingContext2D
let tanks: Tank[] = []
let bullets: Bullet[] = []
let gameLoopId: number
let currentAudioIndex = 0
let audioPool: HTMLAudioElement[] = []

// 颜色名称映射
const colorNames = {
  '#FF4444': 'Red',
  '#44FF44': 'Green',
  '#4444FF': 'Blue',
  '#FF44FF': 'Pink'
}

// 控制方案
const controlSchemes = [
  {
    color: '#FF4444',
    controls: { up: 'W', down: 'S', left: 'A', right: 'D', shoot: 'Space' }
  },
  {
    color: '#44FF44',
    controls: { up: '↑', down: '↓', left: '←', right: '→', shoot: 'Shift' }
  },
  {
    color: '#4444FF',
    controls: { up: 'I', down: 'K', left: 'J', right: 'L', shoot: ';' }
  },
  {
    color: '#FF44FF',
    controls: { up: 'T', down: 'G', left: 'F', right: 'H', shoot: 'R' }
  }
]

// 键盘映射
const keyMap: { [key: number]: { player: number; action: string } } = {
  // 玩家1（红色）
  87: { player: 0, action: 'up' },     // W
  83: { player: 0, action: 'down' },   // S
  65: { player: 0, action: 'left' },   // A
  68: { player: 0, action: 'right' },  // D
  32: { player: 0, action: 'shoot' },  // Space

  // 玩家2（绿色）
  38: { player: 1, action: 'up' },     // ↑
  40: { player: 1, action: 'down' },   // ↓
  37: { player: 1, action: 'left' },   // ←
  39: { player: 1, action: 'right' },  // →
  16: { player: 1, action: 'shoot' },  // Shift

  // 玩家3（蓝色）
  73: { player: 2, action: 'up' },     // I
  75: { player: 2, action: 'down' },   // K
  74: { player: 2, action: 'left' },   // J
  76: { player: 2, action: 'right' },  // L
  186: { player: 2, action: 'shoot' }, // ;

  // 玩家4（粉色）
  84: { player: 3, action: 'up' },     // T
  71: { player: 3, action: 'down' },   // G
  70: { player: 3, action: 'left' },   // F
  72: { player: 3, action: 'right' },  // H
  82: { player: 3, action: 'shoot' }   // R
}

// 坦克类
class Tank {
  x: number
  y: number
  color: string
  health: number
  ammo: number
  isReloading: boolean
  dir: number
  speed: number
  playerId: number
  canShoot: boolean

  constructor(x: number, y: number, color: string, playerId: number) {
    this.x = x
    this.y = y
    this.color = color
    this.health = 100
    this.ammo = 30
    this.isReloading = false
    this.dir = 0
    this.speed = 1.5
    this.playerId = playerId
    this.canShoot = true
  }

  draw() {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.dir)
    ctx.fillStyle = this.color
    ctx.fillRect(-15, -15, 30, 30)
    ctx.fillStyle = 'black'
    ctx.fillRect(10, -5, 20, 10)
    ctx.restore()

    // 血条
    ctx.fillStyle = 'red'
    ctx.fillRect(this.x - 25, this.y - 35, 50, 5)
    ctx.fillStyle = 'lime'
    ctx.fillRect(this.x - 25, this.y - 35, 50 * (this.health / 100), 5)

    // 弹药
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText(`Ammo: ${this.ammo}`, this.x - 20, this.y - 20)
    if (this.isReloading) {
      ctx.fillStyle = 'yellow'
      ctx.fillText('Reloading...', this.x - 25, this.y - 45)
    }
  }

  move(direction: string) {
    const angle = this.dir
    if (direction === 'up') {
      this.x += Math.cos(angle) * this.speed
      this.y += Math.sin(angle) * this.speed
    }
    if (direction === 'down') {
      this.x -= Math.cos(angle) * this.speed
      this.y -= Math.sin(angle) * this.speed
    }
    if (direction === 'left') this.dir -= 0.05
    if (direction === 'right') this.dir += 0.05

    // 边界限制
    this.x = Math.max(30, Math.min(this.x, 800 - 30))
    this.y = Math.max(30, Math.min(this.y, 600 - 30))
  }

  shoot() {
    if (!this.canShoot || this.isReloading || this.ammo <= 0) return

    bullets.push({
      x: this.x + Math.cos(this.dir) * 25,
      y: this.y + Math.sin(this.dir) * 25,
      dir: this.dir,
      speed: 5,
      color: this.color,
      owner: this.playerId
    })

    this.ammo--
    this.canShoot = false

    if (this.ammo === 0) {
      this.isReloading = true
      setTimeout(() => {
        this.ammo = 30
        this.isReloading = false
      }, 1500)
    }
  }
}

// 子弹接口
interface Bullet {
  x: number
  y: number
  dir: number
  speed: number
  color: string
  owner: number
}

// 播放击中音效
function playHitSound() {
  const audio = audioPool[currentAudioIndex]
  audio.currentTime = 0
  audio.play()
  currentAudioIndex = (currentAudioIndex + 1) % audioPool.length
}

// 碰撞检测
function checkCollision(tank: Tank, bullet: Bullet): boolean {
  const dx = tank.x - bullet.x
  const dy = tank.y - bullet.y
  return Math.sqrt(dx * dx + dy * dy) < 20
}

// 记录游戏成绩
function recordGameScore(gameName: string, score: number) {
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
}

// 开始游戏
function startGame(playerCount: number) {
  tanks = []
  bullets = []
  showPlayerSelect.value = false
  victoryMessage.value = ''

  // 设置初始位置
  const positions = [
    [100, 100],   // 玩家1
    [700, 500],   // 玩家2
    [100, 500],   // 玩家3
    [700, 100]    // 玩家4
  ]

  // 创建坦克
  for (let i = 0; i < playerCount; i++) {
    const scheme = controlSchemes[i]
    tanks.push(new Tank(positions[i][0], positions[i][1], scheme.color, i))
  }

  // 开始游戏循环
  gameLoop()
}

// 游戏主循环
function gameLoop() {
  if (isPaused.value) {
    gameLoopId = requestAnimationFrame(gameLoop)
    return
  }

  ctx.clearRect(0, 0, 800, 600)

  // 更新子弹
  bullets.forEach((bullet, index) => {
    bullet.x += Math.cos(bullet.dir) * bullet.speed
    bullet.y += Math.sin(bullet.dir) * bullet.speed

    // 边界检测
    if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
      bullets.splice(index, 1)
      return
    }

    // 碰撞检测
    tanks.forEach(tank => {
      if (tank.playerId !== bullet.owner && tank.health > 0 && checkCollision(tank, bullet)) {
        tank.health -= 10
        bullets.splice(index, 1)
        playHitSound()
      }
    })

    // 绘制子弹
    ctx.fillStyle = bullet.color
    ctx.beginPath()
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // 绘制存活坦克
  const aliveTanks = tanks.filter(t => t.health > 0)
  aliveTanks.forEach(tank => tank.draw())

  // 胜利判断
  if (aliveTanks.length === 1) {
    const winner = aliveTanks[0]
    victoryColor.value = winner.color
    victoryMessage.value = `${colorNames[winner.color]} Tank Wins!`
    
    // 记录游戏成绩
    const finalScore = Math.floor(100 + winner.health)
    recordGameScore("Tank Battle", finalScore)
    
    cancelAnimationFrame(gameLoopId)
    return
  }

  gameLoopId = requestAnimationFrame(gameLoop)
}

// 键盘事件处理
const keys: { [key: number]: boolean } = {}

function handleKeyDown(e: KeyboardEvent) {
  if (!keys[e.keyCode]) {
    keys[e.keyCode] = true
    const control = keyMap[e.keyCode]
    if (control && control.action === 'shoot') {
      const tank = tanks.find(t => t.playerId === control.player)
      if (tank && tank.health > 0) tank.shoot()
    }
    // 阻止默认行为
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault()
    }
  }
}

function handleKeyUp(e: KeyboardEvent) {
  keys[e.keyCode] = false
  const control = keyMap[e.keyCode]
  if (control && control.action === 'shoot') {
    const tank = tanks.find(t => t.playerId === control.player)
    if (tank) tank.canShoot = true
  }
}

// 控制处理
let controlInterval: NodeJS.Timeout

function startControlLoop() {
  controlInterval = setInterval(() => {
    if (isPaused.value) return
    Object.keys(keys).forEach(keyCode => {
      if (keys[parseInt(keyCode)]) {
        const control = keyMap[parseInt(keyCode)]
        if (control && control.action !== 'shoot') {
          const tank = tanks.find(t => t.playerId === control.player)
          if (tank && tank.health > 0) tank.move(control.action)
        }
      }
    })
  }, 16)
}

// 暂停/继续
function togglePause() {
  isPaused.value = !isPaused.value
}

// 重新开始
function restart() {
  cancelAnimationFrame(gameLoopId)
  tanks = []
  bullets = []
  isPaused.value = false
  showPlayerSelect.value = true
  victoryMessage.value = ''
}

// 初始化
onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext('2d')!
    
    // 初始化音频池
    audioPool = [
      hitSound1.value!,
      hitSound2.value!,
      hitSound3.value!,
      hitSound4.value!
    ]
    
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // 开始控制循环
    startControlLoop()
  }
})

// 清理
onUnmounted(() => {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
  if (controlInterval) {
    clearInterval(controlInterval)
  }
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <div class="tank-game">
    <div class="hud">
      <button @click="togglePause" class="control-btn">{{ isPaused ? 'Continue' : 'Pause' }}</button>
      <button @click="restart" class="control-btn">Restart</button>

    </div>

    <!-- 音频池 -->
    <div class="audio-pool" style="display: none">
      <audio ref="hitSound1" src="/sounds/hit-tank.mp3" preload="auto"></audio>
      <audio ref="hitSound2" src="/sounds/hit-tank.mp3" preload="auto"></audio>
      <audio ref="hitSound3" src="/sounds/hit-tank.mp3" preload="auto"></audio>
      <audio ref="hitSound4" src="/sounds/hit-tank.mp3" preload="auto"></audio>
    </div>

    <div class="game-container">
      <div class="controls-panel">
        <h3>Controls</h3>
        <div v-for="(scheme, index) in controlSchemes" :key="index" class="control-item" :style="{ border: `2px solid ${scheme.color}` }">
          <strong :style="{ color: scheme.color }">{{ colorNames[scheme.color] }} Tank (Player {{ index + 1 }}):</strong><br>
          Forward: {{ scheme.controls.up }}<br>
          Backward: {{ scheme.controls.down }}<br>
          Turn Left: {{ scheme.controls.left }}<br>
          Turn Right: {{ scheme.controls.right }}<br>
          Shoot: {{ scheme.controls.shoot }}
        </div>
      </div>

      <div class="game-wrapper">
        <!-- 玩家选择界面 -->
        <div v-if="showPlayerSelect" class="player-select">
          <h2>Select Number of Players</h2>
          <button @click="startGame(2)" class="player-btn">2 Players</button>
          <button @click="startGame(3)" class="player-btn">3 Players</button>
          <button @click="startGame(4)" class="player-btn">4 Players</button>
        </div>

        <!-- 胜利消息 -->
        <div v-if="victoryMessage" class="victory-message" :style="{ color: victoryColor }">
          {{ victoryMessage }}
        </div>

        <canvas ref="gameCanvas" width="800" height="600"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tank-game {
  background: #333;
  color: white;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.hud {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-btn {
  margin: 0 10px;
  padding: 8px 16px;
  background: #555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.control-btn:hover {
  background: #666;
}



.game-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.controls-panel {
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  min-width: 250px;
}

.control-item {
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
}

.game-wrapper {
  position: relative;
}

.player-select {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  z-index: 2;
}

.player-btn {
  display: block;
  margin: 10px auto;
  padding: 10px 20px;
  background: #555;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.player-btn:hover {
  background: #666;
}

.victory-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2em;
  text-shadow: 2px 2px 4px black;
  z-index: 2;
}

canvas {
  border: 2px solid white;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .game-container {
    flex-direction: column;
    align-items: center;
  }
  
  .controls-panel {
    width: 100%;
    max-width: 600px;
  }
  
  canvas {
    max-width: 100%;
    height: auto;
  }
  

}
</style> 