<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 响应式数据
const gameCanvas = ref<HTMLCanvasElement>()
const gameTime = ref(0)
const lifePercent = ref(100) // 改为百分比生命值
const score = ref(0)
const highScore = ref(0)
const gameOver = ref(false)
const paused = ref(false)
const defeatedEnemies = ref(0) // 击败敌机计数

// 游戏状态
let ctx: CanvasRenderingContext2D
let gameLoopId: number
let startTime = 0
const pauseTime = 0


// 玩家对象
const player = ref({
  x: 575,
  y: 700,
  width: 70,
  height: 70,
  speed: 8,
  bullets: [] as Bullet[],
  ammo: 30,
  reloading: false,
  canShoot: true
})

// 游戏对象
let enemies: Enemy[] = []
let enemyBullets: EnemyBullet[] = []
let explosions: Explosion[] = []
let medkit = {
  active: false,
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  spawnTimer: 0
}

// 键盘状态
const keys: { [key: string]: boolean } = {}

// 接口定义
interface Bullet {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Enemy {
  x: number
  y: number
  width: number
  height: number
  speed: number
  health: number
  lastFire: number
  fireCooldown: number
}

interface EnemyBullet {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Explosion {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  growing: boolean
}

// 初始化游戏
function initGame() {
  if (!gameCanvas.value) return
  
  ctx = gameCanvas.value.getContext('2d')!
  startTime = Date.now()
  
  // 加载最高分
  highScore.value = parseInt(localStorage.getItem('planeHighScore') || '0')
  
  // 重置游戏状态
  resetGameState()
  
  // 开始游戏循环
  gameLoop()
}

// 重置游戏状态
function resetGameState() {
  player.value = {
    x: 575,
    y: 700,
    width: 70,
    height: 70,
    speed: 8,
    bullets: [],
    ammo: 30,
    reloading: false,
    canShoot: true
  }
  
  enemies = []
  enemyBullets = []
  explosions = []
  gameTime.value = 0
  lifePercent.value = 100 // 重置生命百分比
  score.value = 0
  gameOver.value = false
  paused.value = false
  startTime = Date.now()
  defeatedEnemies.value = 0 // 重置击败敌机计数
  
  medkit = {
    active: false,
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    spawnTimer: 0
  }
}

// 控制玩家
function controlPlayer() {
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    player.value.x = Math.max(0, player.value.x - player.value.speed)
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    player.value.x = Math.min(1200 - player.value.width, player.value.x + player.value.speed)
  }
  if (keys['ArrowUp'] || keys['w'] || keys['W']) {
    player.value.y = Math.max(0, player.value.y - player.value.speed)
  }
  if (keys['ArrowDown'] || keys['s'] || keys['S']) {
    player.value.y = Math.min(800 - player.value.height, player.value.y + player.value.speed)
  }
  if (keys[' '] && player.value.canShoot && !player.value.reloading && player.value.ammo > 0) {
    shoot()
  }
}

// 射击
function shoot() {
  player.value.bullets.push({
    x: player.value.x + player.value.width / 2 - 3,
    y: player.value.y,
    width: 6,
    height: 20,
    speed: 12
  })
  
  player.value.ammo--
  player.value.canShoot = false
  
  if (player.value.ammo === 0) {
    player.value.reloading = true
    setTimeout(() => {
      player.value.ammo = 30
      player.value.reloading = false
    }, 2000)
  }
  
  setTimeout(() => {
    player.value.canShoot = true
  }, 100)
}

// 生成敌人
function spawnEnemy() {
  if (Math.random() < 0.02) {
    enemies.push({
      x: Math.random() * (1200 - 50),
      y: -50,
      width: 50,
      height: 50,
      speed: Math.random() * 2 + 1,
      health: Math.random() > 0.7 ? 2 : 1,
      lastFire: Date.now(),
      fireCooldown: Math.random() * 2000 + 1000
    })
  }
}

// 敌人射击
function enemyFire() {
  enemies.forEach(enemy => {
    if (Date.now() - enemy.lastFire > enemy.fireCooldown && !paused.value) {
      enemyBullets.push({
        x: enemy.x + 25,
        y: enemy.y + 50,
        width: 10,
        height: 24,
        speed: 5
      })
      enemy.lastFire = Date.now()
      enemy.fireCooldown = Math.random() * 2000 + 1000
    }
  })
}

// 碰撞检测
function checkCollision(rect1: any, rect2: any): boolean {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y
}

// 创建爆炸效果
function createExplosion(x: number, y: number) {
  explosions.push({
    x,
    y,
    radius: 0,
    maxRadius: 30,
    alpha: 1,
    growing: true
  })
}

// 生成治疗包
function spawnMedkit() {
  if (!medkit.active && Date.now() - medkit.spawnTimer > 15000) {
    medkit.active = true
    medkit.x = Math.random() * (1200 - 40)
    medkit.y = Math.random() * (400 - 40) + 100
    medkit.spawnTimer = Date.now()
  }
}

// 更新游戏时间
function updateTimer() {
  if (!paused.value && !gameOver.value) {
    gameTime.value = Math.floor((Date.now() - startTime) / 1000)
  }
}

// 更新爆炸效果
function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i]
    
    if (explosion.growing) {
      explosion.radius += 2
      if (explosion.radius >= explosion.maxRadius) {
        explosion.growing = false
      }
    } else {
      explosion.alpha -= 0.05
      if (explosion.alpha <= 0) {
        explosions.splice(i, 1)
        continue
      }
    }
    
    // 绘制爆炸
    ctx.beginPath()
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(explosion.x, explosion.y, explosion.radius * 0.7, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 0, ${explosion.alpha})`
    ctx.fill()
  }
}

// 记录游戏成绩
function recordGameScore(gameName: string, finalScore: number) {
  const today = new Date().toLocaleDateString('zh-CN')
  const now = new Date().toLocaleTimeString('zh-CN')
  const scores = JSON.parse(localStorage.getItem('gameScores') || '{}')

  if (!scores[today]) {
    scores[today] = {}
  }

  if (!scores[today][gameName]) {
    scores[today][gameName] = {
      highScore: finalScore,
      playCount: 1,
      lastPlayed: now
    }
  } else {
    const gameData = scores[today][gameName]
    gameData.playCount += 1
    gameData.lastPlayed = now
    if (finalScore > gameData.highScore) {
      gameData.highScore = finalScore
    }
  }

  localStorage.setItem('gameScores', JSON.stringify(scores))
}

// 游戏主循环
function gameLoop() {
  if (gameOver.value) return

  updateTimer()

  // 绘制星空背景
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 1200, 800)

  // 绘制星星
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 1200
    const y = Math.random() * 800
    const size = Math.random() * 2
    const brightness = Math.random() * 50 + 50

    ctx.fillStyle = `rgba(255, 255, 255, ${brightness / 100})`
    ctx.fillRect(x, y, size, size)
  }

  if (!paused.value) {
    controlPlayer()
    spawnEnemy()
    enemyFire()
    spawnMedkit()
  }

  // 绘制玩家
  const gradient = ctx.createLinearGradient(
    player.value.x, player.value.y,
    player.value.x, player.value.y + player.value.height
  )
  gradient.addColorStop(0, '#30cfd0')
  gradient.addColorStop(1, '#330867')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(player.value.x + 35, player.value.y)
  ctx.lineTo(player.value.x, player.value.y + 70)
  ctx.lineTo(player.value.x + 70, player.value.y + 70)
  ctx.closePath()
  ctx.fill()

  // 绘制治疗包
  if (medkit.active) {
    ctx.fillStyle = '#00FF00'
    ctx.beginPath()
    ctx.roundRect(medkit.x, medkit.y, 40, 40, 8)
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.fillRect(medkit.x + 15, medkit.y + 5, 10, 30)
    ctx.fillRect(medkit.x + 5, medkit.y + 15, 30, 10)

    // 检查治疗包碰撞
    if (checkCollision(player.value, medkit)) {
      lifePercent.value = Math.min(100, lifePercent.value + 20) // 加20%生命值
      medkit.active = false
    }
  }

  // 更新玩家子弹
  player.value.bullets.forEach((bullet, i) => {
    if (!paused.value) bullet.y -= bullet.speed

    const bulletGradient = ctx.createLinearGradient(
      bullet.x, bullet.y,
      bullet.x, bullet.y + bullet.height
    )
    bulletGradient.addColorStop(0, '#FFEB3B')
    bulletGradient.addColorStop(1, '#FF9800')

    ctx.fillStyle = bulletGradient
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

    // 检查敌人碰撞
    enemies.forEach((enemy, j) => {
      if (checkCollision(bullet, enemy)) {
        enemy.health--
        if (enemy.health <= 0) {
          createExplosion(enemy.x + 25, enemy.y + 25)
          score.value += 10
          defeatedEnemies.value++ // 增加击败敌机数量
          enemies.splice(j, 1)
        }
        player.value.bullets.splice(i, 1)
        return
      }
    })
    
    // 检查子弹与敌方子弹的碰撞（抵消效果）
    for (let j = enemyBullets.length - 1; j >= 0; j--) {
      if (checkCollision(bullet, enemyBullets[j])) {
        createExplosion(bullet.x, bullet.y)
        player.value.bullets.splice(i, 1)
        enemyBullets.splice(j, 1)
        return
      }
    }

    if (bullet.y < 0) player.value.bullets.splice(i, 1)
  })

  // 更新敌人子弹
  enemyBullets.forEach((bullet, i) => {
    if (!paused.value) bullet.y += bullet.speed

    ctx.fillStyle = '#FF4444'
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

    // 检查玩家碰撞
    if (checkCollision(bullet, player.value)) {
      createExplosion(player.value.x + 35, player.value.y + 35)
      lifePercent.value -= 20 // 减少20%生命值
      enemyBullets.splice(i, 1)

      if (lifePercent.value <= 0) {
        endGame()
      }
    }

    if (bullet.y > 800) enemyBullets.splice(i, 1)
  })

  // 更新敌人
  enemies.forEach((enemy, i) => {
    if (!paused.value) enemy.y += enemy.speed

    const enemyGradient = ctx.createLinearGradient(
      enemy.x, enemy.y,
      enemy.x, enemy.y + enemy.height
    )
    enemyGradient.addColorStop(0, '#F44336')
    enemyGradient.addColorStop(1, '#D50000')

    ctx.fillStyle = enemyGradient
    ctx.beginPath()
    ctx.moveTo(enemy.x + 25, enemy.y + 50)
    ctx.lineTo(enemy.x, enemy.y)
    ctx.lineTo(enemy.x + 50, enemy.y)
    ctx.closePath()
    ctx.fill()

    // 检查玩家碰撞
    if (checkCollision(enemy, player.value)) {
      createExplosion(enemy.x + 25, enemy.y + 25)
      lifePercent.value -= 20 // 减少20%生命值
      enemies.splice(i, 1)

      if (lifePercent.value <= 0) {
        endGame()
      }
    }

    if (enemy.y > 800) enemies.splice(i, 1)
  })
  

  // 更新爆炸效果
  updateExplosions()

  // 绘制暂停界面
  if (paused.value) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, 1200, 800)

    ctx.fillStyle = '#30cfd0'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Paused', 600, 400)
    ctx.font = '24px Arial'
    ctx.fillText('Click Continue to resume', 600, 450)
    ctx.textAlign = 'left'
  }

  gameLoopId = requestAnimationFrame(gameLoop)
}

// 结束游戏
function endGame() {
  gameOver.value = true
  
  // 记录最高分
  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem('planeHighScore', highScore.value.toString())
  }
  
  // 记录游戏成绩
  recordGameScore("Plane Battle", score.value)
  
  cancelAnimationFrame(gameLoopId)
}

// 暂停/继续
function togglePause() {
  paused.value = !paused.value
}

// 手动换弹
function manualReload() {
  if (!player.value.reloading && !gameOver.value) {
    player.value.reloading = true
    player.value.ammo = 30
    setTimeout(() => {
      player.value.reloading = false
    }, 2000)
  }
}

// 重新开始游戏
function restartGame() {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
  resetGameState()
  initGame()
}


// 键盘事件处理
function handleKeyDown(e: KeyboardEvent) {
  keys[e.key] = true
  
  // E键暂停/继续游戏
  if (e.key === 'e' || e.key === 'E') {
    togglePause()
    e.preventDefault()
  }
  
  // R键手动换弹
  if (e.key === 'r' || e.key === 'R') {
    manualReload()
    e.preventDefault()
  }
}

function handleKeyUp(e: KeyboardEvent) {
  keys[e.key] = false
}

// 生命周期
onMounted(() => {
  if (gameCanvas.value) {
    initGame()
    
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }
})

onUnmounted(() => {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <div class="plane-game">
    <!-- HUD界面 -->
    <div class="hud">
      <div>Time: <span>{{ gameTime }}</span>s</div>
      <div>Health: <span>{{ lifePercent }}%</span></div>
      <div>Score: <span>{{ score }}</span></div>
      <div>High Score: <span>{{ highScore }}</span></div>
      <div>Ammo: <span>{{ player.reloading ? 'Reloading...' : player.ammo }}</span></div>
      <div>Enemies Defeated: <span>{{ defeatedEnemies }}</span></div>
    </div>

    <!-- 生命值进度条 -->
    <div class="health-bar">
      <div class="health-fill" :style="{ height: lifePercent + '%' }"/>
    </div>

    <!-- 游戏结束界面 -->
    <div v-if="gameOver" class="game-over-screen">
      <h1>Game Over</h1>
      <p>Your Score: <span>{{ score }}</span></p>
      <button class="restart-btn" @click="restartGame">Play Again</button>
    </div>

    <!-- 控制说明 -->
    <div v-if="!gameOver" class="instructions">
      <h4>Controls</h4>
      <div class="instructions-content">
        <p><strong>Movement:</strong> Arrow Keys or WASD</p>
        <p><strong>Shoot:</strong> Space</p>
        <p><strong>Pause:</strong> E</p>
        <p><strong>Reload:</strong> R</p>
      </div>
    </div>

    <canvas ref="gameCanvas" width="1200" height="800"/>
  </div>
</template>

<style scoped>
.plane-game {
  margin: 0;
  overflow: hidden;
  background: #000;
  font-family: 'Arial', sans-serif;
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  border: 2px solid #30cfd0;
  box-shadow: 0 0 20px #30cfd0;
  position: relative;
  z-index: 5;
}

.hud {
  position: fixed;
  top: 20px;
  left: 20px;
  color: #30cfd0;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #30cfd0;
  z-index: 50;
  text-shadow: 0 0 5px #30cfd0;
  max-width: 200px; /* 限制宽度 */
}

.hud div {
  margin: 5px 0;
}

.game-over-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 30;
}

.game-over-screen h1 {
  color: #FF5252;
  font-size: 50px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px #FF5252;
}

.game-over-screen p {
  color: white;
  font-size: 24px;
  margin-bottom: 30px;
}

.restart-btn {
  background: #330867;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 20px;
  border-radius: 30px;
  cursor: pointer;
  font-family: 'Arial', sans-serif;
  box-shadow: 0 0 15px #30cfd0;
  transition: all 0.3s ease;
}

.restart-btn:hover {
  background: #30cfd0;
  box-shadow: 0 0 25px #30cfd0;
}

/* 控制说明 */
.instructions {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #30cfd0;
  z-index: 50;
  color: #30cfd0;
  min-width: 200px;
  box-shadow: 0 0 10px rgba(48, 207, 208, 0.5);
}

.instructions h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  text-shadow: 0 0 5px #30cfd0;
  border-bottom: 1px solid rgba(48, 207, 208, 0.3);
  padding-bottom: 8px;
}

.instructions-content {
  font-size: 14px;
}

.instructions-content p {
  margin: 5px 0;
  line-height: 1.4;
}

/* 生命值进度条 */
.health-bar {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 200px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #30cfd0;
  border-radius: 15px;
  overflow: hidden;
  z-index: 50;
  box-shadow: 0 0 10px rgba(48, 207, 208, 0.5);
}

.health-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, #FF5252, #FF867F);
  transition: height 0.3s ease;
}

@media (max-width: 1200px) {
  canvas {
    max-width: 100vw;
    max-height: 80vh;
    width: auto;
    height: auto;
  }
  
  .hud {
    font-size: 14px;
    padding: 10px;
    max-width: 180px;
  }
  
  .health-bar {
    width: 25px;
    height: 150px;
    top: 15px;
    right: 15px;
  }
  
  .instructions {
    font-size: 12px;
    padding: 10px;
    min-width: 160px;
  }
  
  .instructions-content {
    font-size: 12px;
  }
}
</style> 