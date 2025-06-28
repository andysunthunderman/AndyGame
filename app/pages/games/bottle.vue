<template>
  <div class="bottle-page">
    <div class="ocean">
      <div class="waves"/>
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
          />
          <div v-else class="message">{{ bottleContent }}</div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </div>
        <div class="dialog-buttons">
          <button
            v-if="isWriting"
            :disabled="!bottleContent.trim() || isLoading"
            @click="throwBottle"
          >
            {{ isLoading ? '正在扔出...' : '扔出去' }}
          </button>
          <template v-else>
            <button :disabled="isLoading" @click="throwBack">扔回海里</button>
            <button :disabled="isLoading" @click="closeBottle">关闭</button>
          </template>
          <button :disabled="isLoading" @click="closeDialog">取消</button>
        </div>
      </div>
    </div>

    <!-- 主按钮 -->
    <div class="main-buttons">
      <button class="pick-btn" :disabled="isLoading" @click="pickBottle">
        {{ isLoading ? '正在打捞...' : '打捞漂流瓶' }}
      </button>
      <button class="write-btn" :disabled="isLoading" @click="writeBottle">
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
  font-weight: bold;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.main-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-buttons button:not(:disabled):hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.pick-btn {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
}

.write-btn {
  background: linear-gradient(45deg, #4299e1, #0077BE);
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
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dialog h3 {
  margin: 0 0 25px 0;
  text-align: center;
  color: #1a365d;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dialog-content {
  margin-bottom: 25px;
}

.dialog-content label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 15px;
  border: 2px solid #cbd5e0;
  border-radius: 10px;
  resize: none;
  font-size: 16px;
  color: #2d3748;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #0077BE;
  box-shadow: 0 0 0 3px rgba(0, 119, 190, 0.1);
  background: white;
}

textarea::placeholder {
  color: #a0aec0;
  font-style: italic;
}

.message {
  white-space: pre-wrap;
  padding: 20px;
  background: linear-gradient(135deg, #e6fffa, #f0fff4);
  border-radius: 10px;
  min-height: 120px;
  color: #2d3748;
  line-height: 1.6;
  font-size: 16px;
  border: 1px solid rgba(0, 119, 190, 0.2);
}

.dialog-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.dialog-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dialog-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.dialog-buttons button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.dialog-buttons button:last-child {
  background: linear-gradient(45deg, #718096, #4a5568);
}

.error-message {
  color: #e53e3e;
  margin-top: 15px;
  text-align: center;
  font-weight: 600;
  background: rgba(254, 178, 178, 0.2);
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.success-message {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
  box-shadow: 0 4px 20px rgba(72, 187, 120, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}
</style> 