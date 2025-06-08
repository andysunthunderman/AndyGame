<template>
  <div class="bottle-page">
    <div class="ocean">
      <div class="waves"></div>
    </div>
    
    <!-- 漂流瓶对话框 -->
    <div v-if="showBottleDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>{{ dialogTitle }}</h3>
        <div class="dialog-content">
          <textarea
            v-if="isWriting"
            v-model="bottleContent"
            placeholder="写下你想说的话..."
            :maxlength="500"
          ></textarea>
          <div v-else class="message">{{ bottleContent }}</div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </div>
        <div class="dialog-buttons">
          <button
            v-if="isWriting"
            @click="throwBottle"
            :disabled="!bottleContent.trim() || isLoading"
          >
            {{ isLoading ? '正在扔出...' : '扔出去' }}
          </button>
          <template v-else>
            <button @click="throwBack" :disabled="isLoading">扔回海里</button>
            <button @click="closeBottle" :disabled="isLoading">关闭</button>
          </template>
          <button @click="closeDialog" :disabled="isLoading">取消</button>
        </div>
      </div>
    </div>

    <!-- 主按钮 -->
    <div class="main-buttons">
      <button @click="pickBottle" class="pick-btn" :disabled="isLoading">
        {{ isLoading ? '正在打捞...' : '打捞漂流瓶' }}
      </button>
      <button @click="writeBottle" class="write-btn" :disabled="isLoading">
        {{ isLoading ? '准备中...' : '写漂流瓶' }}
      </button>
    </div>

    <!-- 提示消息 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'game'
})

const showBottleDialog = ref(false)
const isWriting = ref(false)
const bottleContent = ref('')
const dialogTitle = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 显示成功消息
function showSuccess(message) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// 显示错误消息
function showError(message) {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

// 写漂流瓶
function writeBottle() {
  dialogTitle.value = '写一个漂流瓶'
  isWriting.value = true
  bottleContent.value = ''
  errorMessage.value = ''
  showBottleDialog.value = true
}

// 打捞漂流瓶
async function pickBottle() {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch('/api/bottle/pick')
    const data = await response.json()
    
    if (data.success) {
      bottleContent.value = data.content
      dialogTitle.value = '你打捞到一个漂流瓶！'
      isWriting.value = false
      showBottleDialog.value = true
    } else {
      showError(data.error || '打捞失败，请稍后再试')
    }
  } catch (error) {
    console.error('打捞失败:', error)
    showError('网络错误，请稍后再试')
  } finally {
    isLoading.value = false
  }
}

// 扔出漂流瓶
async function throwBottle() {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch('/api/bottle/throw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: bottleContent.value,
      }),
    })
    const data = await response.json()
    
    if (data.success) {
      showSuccess('漂流瓶已扔出！')
      closeDialog()
    } else {
      showError(data.error || '投掷失败，请稍后再试')
    }
  } catch (error) {
    console.error('投掷失败:', error)
    showError('网络错误，请稍后再试')
  } finally {
    isLoading.value = false
  }
}

// 扔回海里
async function throwBack() {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch('/api/bottle/throwback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: bottleContent.value,
      }),
    })
    const data = await response.json()
    
    if (data.success) {
      showSuccess('漂流瓶已扔回海里')
      closeDialog()
    } else {
      showError(data.error || '操作失败，请稍后再试')
    }
  } catch (error) {
    console.error('扔回失败:', error)
    showError('网络错误，请稍后再试')
  } finally {
    isLoading.value = false
  }
}

// 关闭漂流瓶
async function closeBottle() {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch('/api/bottle/close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: bottleContent.value,
      }),
    })
    const data = await response.json()
    
    if (data.success) {
      closeDialog()
    } else {
      showError(data.error || '操作失败，请稍后再试')
    }
  } catch (error) {
    console.error('关闭失败:', error)
    showError('网络错误，请稍后再试')
  } finally {
    isLoading.value = false
  }
}

// 关闭对话框
function closeDialog() {
  showBottleDialog.value = false
  bottleContent.value = ''
  errorMessage.value = ''
}
</script>

<style scoped>
.bottle-page {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%);
  overflow: hidden;
}

.ocean {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(180deg, #0077BE 0%, #005C99 100%);
}

.waves {
  position: absolute;
  top: -50px;
  width: 100%;
  height: 50px;
  background: 
    radial-gradient(circle at 50% 0%, #FFF 20%, transparent 20%) 0 0,
    radial-gradient(circle at 50% 0%, #FFF 20%, transparent 20%) 50px 0;
  background-size: 100px 100px;
  animation: wave 3s linear infinite;
}

@keyframes wave {
  0% { background-position-x: 0, 50px; }
  100% { background-position-x: 100px, 150px; }
}

.main-buttons {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.main-buttons button {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s;
  opacity: 1;
}

.main-buttons button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.main-buttons button:not(:disabled):hover {
  transform: scale(1.05);
}

.pick-btn {
  background-color: #4CAF50;
  color: white;
}

.write-btn {
  background-color: #2196F3;
  color: white;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
}

.dialog h3 {
  margin: 0 0 20px 0;
  text-align: center;
}

.dialog-content {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
}

.message {
  white-space: pre-wrap;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
  min-height: 100px;
}

.dialog-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  transition: all 0.3s ease;
}

.dialog-buttons button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.dialog-buttons button:not(:disabled):hover {
  opacity: 0.9;
}

.dialog-buttons button:last-child {
  background-color: #9e9e9e;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}

.success-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}
</style> 