<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 游戏配置
const BOARD_SIZE = 12
const MINE_COUNT = 11

// 响应式数据
const grid = ref<any[]>([])
const isMarking = ref(false)
const gameOver = ref(false)
const timeElapsed = ref(0)
const consecutiveCorrect = ref(0)
const correctMarks = ref(0)
const totalClicks = ref(0)
const difficulty = ref(1)
const isSoundEnabled = ref(true)
const isPaused = ref(false)

let timerInterval: NodeJS.Timeout

// 音效对象
const sounds = ref<any>({})

// 初始化音效
const initSounds = () => {
  if (process.client) {
    sounds.value = {
      explosion: new Audio('/sounds/boom.m4a')
    }
    sounds.value.explosion.volume = 0.7
  }
}

// 播放音效
const playSound = (soundName: string) => {
  if (isSoundEnabled.value && sounds.value[soundName]) {
    sounds.value[soundName].currentTime = 0
    sounds.value[soundName].play().catch(e => console.log('音效播放失败:', e))
  }
}

// 初始化游戏
const initGame = () => {
  gameOver.value = false
  timeElapsed.value = 0
  consecutiveCorrect.value = 0
  correctMarks.value = 0
  totalClicks.value = 0
  difficulty.value = 1
  startTimer()
  
  // 创建网格
  grid.value = Array.from({length: BOARD_SIZE}, (_, x) => 
    Array.from({length: BOARD_SIZE}, (_, y) => ({
      x, y,
      isMine: false,
      isMarked: false,
      isRevealed: false,
      number: 0
    }))
  )

  // 放置地雷
  let minesPlaced = 0
  while (minesPlaced < MINE_COUNT) {
    const x = Math.floor(Math.random() * BOARD_SIZE)
    const y = Math.floor(Math.random() * BOARD_SIZE)
    if (!grid.value[x][y].isMine) {
      grid.value[x][y].isMine = true
      minesPlaced++
    }
  }

  // 计算数字
  grid.value.forEach(row => row.forEach(cell => {
    if (!cell.isMine) {
      cell.number = countAdjacentMines(cell.x, cell.y)
    }
  }))
}

// 计算周围地雷数量
const countAdjacentMines = (x: number, y: number) => {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < BOARD_SIZE && 
          ny >= 0 && ny < BOARD_SIZE &&
          grid.value[nx][ny].isMine) {
        count++
      }
    }
  }
  return count
}

// 处理单元格点击
const handleCellClick = (cell: any) => {
  if (gameOver.value || cell.isRevealed) return

  totalClicks.value++

  if (isMarking.value) {
    toggleMark(cell)
  } else {
    if (!cell.isMine) {
      consecutiveCorrect.value++
    }
    revealCell(cell)
  }

  checkWin()
}

// 显示单元格
const revealCell = (cell: any) => {
  if (cell.isMarked) return
  
  cell.isRevealed = true
  if (cell.isMine) {
    gameOver.value = true
    playSound('explosion')
    revealAllMines()
    setTimeout(() => {
      showGameOver(false)
    }, 500)
    return
  }

  // 自动展开空白区域
  if (cell.number === 0) {
    expandAround(cell.x, cell.y)
  }
}

// 递归展开空白区域
const expandAround = (x: number, y: number) => {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < BOARD_SIZE && 
          ny >= 0 && ny < BOARD_SIZE) {
        const cell = grid.value[nx][ny]
        if (!cell.isRevealed && !cell.isMine && !cell.isMarked) {
          cell.isRevealed = true
          if (cell.number === 0) {
            expandAround(nx, ny)
          }
        }
      }
    }
  }
}

// 切换标记
const toggleMark = (cell: any) => {
  if (!cell.isRevealed) {
    const currentMarked = grid.value.flat().filter(c => c.isMarked).length
    if (!cell.isMarked && currentMarked >= MINE_COUNT) {
      alert('Maximum number of marks reached!')
      return
    }
    cell.isMarked = !cell.isMarked
    if (cell.isMarked && cell.isMine) {
      correctMarks.value++
    } else if (!cell.isMarked && cell.isMine) {
      correctMarks.value--
    }
  }
}

// 检查胜利条件
const checkWin = () => {
  const allSafeRevealed = grid.value.flat().every(cell => 
    cell.isMine || cell.isRevealed
  )
  
  const allMinesMarked = grid.value.flat().every(cell => 
    cell.isMine === cell.isMarked
  ) && grid.value.flat().filter(c => c.isMarked).length === MINE_COUNT

  if (allSafeRevealed && allMinesMarked) {
    gameOver.value = true
    revealAllMines()
    setTimeout(() => {
      showGameOver(true)
    }, 500)
  }
}

// 显示所有地雷
const revealAllMines = () => {
  grid.value.flat().forEach(cell => {
    if (cell.isMine) cell.isRevealed = true
  })
  if (timerInterval) {
    clearInterval(timerInterval)
  }
}

// 显示游戏结束对话框
const showGameOver = (isWin: boolean) => {
  const message = isWin ? 'Congratulations! You won!' : 'Game Over!'
  const baseScore = Math.floor((60 - timeElapsed.value) * (isWin ? 100 : 50))
  const comboBonus = consecutiveCorrect.value * (isWin ? 50 : 25)
  const markingBonus = Math.floor((correctMarks.value / MINE_COUNT) * (isWin ? 1000 : 500))
  const efficiencyBonus = Math.floor((isWin ? 1000 : 500) * (1 - totalClicks.value / (BOARD_SIZE * BOARD_SIZE)))
  const difficultyMultiplier = isWin ? 
    1 + (correctMarks.value / MINE_COUNT) * 0.5 + (1 - timeElapsed.value / 60) * 0.5 :
    0.5 + (correctMarks.value / MINE_COUNT) * 0.3 + (1 - timeElapsed.value / 60) * 0.2
  const finalScore = Math.floor((baseScore + comboBonus + markingBonus + efficiencyBonus) * difficultyMultiplier)

  const result = confirm(`${message}\n\nBase Score: ${baseScore}\nCombo Bonus: ${comboBonus}\nMarking Bonus: ${markingBonus}\nEfficiency Bonus: ${efficiencyBonus}\nDifficulty Multiplier: ×${difficultyMultiplier.toFixed(2)}\n\nFinal Score: ${finalScore}\n\nClick OK to restart, Cancel to return to homepage`)
  
  if (result) {
    restartGame()
  } else {
    navigateTo('/')
  }
}

// 重新开始游戏
const restartGame = () => {
  isMarking.value = false
  initGame()
}

// 开始计时
const startTimer = () => {
  timeElapsed.value = 0
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  timerInterval = setInterval(() => {
    if (!gameOver.value && !isPaused.value) {
      timeElapsed.value++
    }
  }, 1000)
}

// 切换标记模式
const toggleMarkMode = () => {
  isMarking.value = !isMarking.value
}

// 切换音效
const toggleSound = () => {
  isSoundEnabled.value = !isSoundEnabled.value
}

// 获取标记计数
const getMarkCount = computed(() => {
  const marked = grid.value.flat().filter(c => c.isMarked).length
  return `Mark Mode (${marked}/${MINE_COUNT})`
})

// 获取单元格显示内容
const getCellContent = (cell: any) => {
  if (cell.isMarked) return '🚩'
  if (!cell.isRevealed) return ''
  if (cell.isMine) return '💣'
  return cell.number > 0 ? cell.number : ''
}

// 获取单元格样式类
const getCellClass = (cell: any) => {
  const classes = ['cell']
  if (cell.isRevealed) classes.push('revealed')
  if (cell.isMarked) classes.push('marked')
  if (cell.isMine && cell.isRevealed) classes.push('mine')
  if (cell.number > 0 && cell.isRevealed) classes.push(`number-${cell.number}`)
  return classes.join(' ')
}

// 右键点击处理
const handleRightClick = (event: Event, cell: any) => {
  event.preventDefault()
  if (!gameOver.value && !cell.isRevealed) {
    toggleMark(cell)
  }
}

onMounted(() => {
  initSounds()
  initGame()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<template>
  <div class="minesweeper-game">


    <!-- 游戏标题 -->
    <h1 class="game-title">Minesweeper</h1>

    <!-- 游戏容器 -->
    <div class="game-container">
      <!-- 游戏板 -->
      <div class="game-board">
        <div 
          v-for="(row, x) in grid" 
          :key="x" 
          class="board-row"
        >
          <div
            v-for="(cell, y) in row"
            :key="`${x}-${y}`"
            :class="getCellClass(cell)"
            @click="handleCellClick(cell)"
            @contextmenu="handleRightClick($event, cell)"
          >
            {{ getCellContent(cell) }}
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button 
          class="button mark-button" 
          :class="{ active: isMarking }"
          @click="toggleMarkMode"
        >
          {{ getMarkCount }}
        </button>
        <button 
          class="button restart-button" 
          @click="restartGame"
        >
          Restart
        </button>
      </div>

      <!-- 声音控制 -->
      <div class="sound-control">
        <button 
          class="sound-button" 
          @click="toggleSound"
        >
          {{ isSoundEnabled ? '🔊 Sound: On' : '🔈 Sound: Off' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.minesweeper-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}



.game-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #374151;
  text-align: center;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.game-board {
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  padding: 10px;
}

.game-board:hover {
  transform: translateY(-5px);
}

.board-row {
  display: flex;
}

.cell {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f3f4f6;
  font-weight: bold;
  transition: all 0.2s ease;
  font-size: 1.2rem;
  user-select: none;
}

.cell:hover {
  background-color: #e5e7eb;
  transform: scale(1.1);
  z-index: 10;
  position: relative;
}

.cell.revealed {
  background-color: white;
}

.cell.marked {
  background-color: #fde68a;
  animation: pulse 2s infinite;
}

.cell.mine {
  background-color: #ef4444;
  animation: headShake 1s;
}

.cell.number-1 { color: #3b82f6; }
.cell.number-2 { color: #10b981; }
.cell.number-3 { color: #ef4444; }
.cell.number-4 { color: #6366f1; }
.cell.number-5 { color: #7c3aed; }
.cell.number-6 { color: #059669; }
.cell.number-7 { color: #db2777; }
.cell.number-8 { color: #475569; }

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  transform: scale(1);
  border: none;
  cursor: pointer;
}

.button:hover {
  transform: scale(1.05);
}

.mark-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mark-button.active {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.restart-button {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.sound-control {
  display: flex;
  justify-content: center;
}

.sound-button {
  font-size: 0.875rem;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.sound-button:hover {
  color: #374151;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes headShake {
  0% { transform: translateX(0); }
  6.5% { transform: translateX(-6px) rotateY(-9deg); }
  18.5% { transform: translateX(5px) rotateY(7deg); }
  31.5% { transform: translateX(-3px) rotateY(-5deg); }
  43.5% { transform: translateX(2px) rotateY(3deg); }
  50% { transform: translateX(0); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cell {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
  
  .game-title {
    font-size: 2rem;
  }
  
  .controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  

}
</style> 