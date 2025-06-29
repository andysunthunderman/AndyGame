<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'game'
})

// 定义留言类型
interface Message {
  id: number
  nickname: string
  content: string
  created_at: string
}

// API 基础URL
const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''

// 留言板API客户端
const messageApi = {
  async getAllMessages(): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages`)
    if (!response.ok) {
      throw new Error(`获取留言失败: HTTP ${response.status}`)
    }
    const data = await response.json()
    return data.messages || []
  },
  
  async createMessage(nickname: string, content: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname, content }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.statusMessage || errorData.error || `提交失败: HTTP ${response.status}`)
    }
  },

  async deleteMessage(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.statusMessage || errorData.error || `删除失败: HTTP ${response.status}`)
    }
  }
}

// 响应式数据
const messages = ref<Message[]>([])
const newMessage = ref({
  nickname: '',
  content: ''
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isDeleting = ref(false)
const maxZIndex = ref(1000)
const showForm = ref(false)

// 便签颜色数组
const noteColors = [
  '#FFEAA7', // 黄色
  '#FFCBC4', // 粉色
  '#C4E5FF', // 蓝色
  '#C8E6C9', // 绿色
  '#FFE0B2', // 橙色
  '#F8BBD9', // 紫粉色
  '#D1C4E9', // 紫色
  '#B3E5FC', // 浅蓝色
]

// 获取所有留言
const fetchMessages = async () => {
  try {
    messages.value = await messageApi.getAllMessages()
  } catch (error) {
    console.error('获取留言失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '获取留言失败，请稍后再试'
  }
}

// 提交新留言
const submitMessage = async () => {
  // 表单验证
  if (!newMessage.value.nickname.trim() || !newMessage.value.content.trim()) {
    errorMessage.value = '请填写昵称和留言内容'
    return
  }
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    await messageApi.createMessage(
      newMessage.value.nickname.trim(), 
      newMessage.value.content.trim()
    )
    
    // 提交成功后清空表单
    newMessage.value.nickname = ''
    newMessage.value.content = ''
    successMessage.value = '留言提交成功！'
    
    // 重新获取留言列表
    await fetchMessages()
    
    // 3秒后清除成功提示
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('提交留言失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '提交留言失败，请稍后再试'
  } finally {
    isSubmitting.value = false
  }
}

// 删除留言
const deleteMessage = async (id: number) => {
  if (isDeleting.value) return
  
  isDeleting.value = true
  errorMessage.value = ''
  
  try {
    await messageApi.deleteMessage(id)
    successMessage.value = '留言删除成功！'
    
    // 重新获取留言列表
    await fetchMessages()
    
    // 3秒后清除成功提示
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('删除留言失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '删除留言失败，请稍后再试'
  } finally {
    isDeleting.value = false
  }
}

// 便签点击处理，显示在最上层
const handleNoteClick = (event: Event) => {
  const noteElement = event.currentTarget as HTMLElement
  maxZIndex.value += 1
  noteElement.style.zIndex = maxZIndex.value.toString()
}

// 获取便签颜色
const getNoteColor = (index: number) => {
  return noteColors[index % noteColors.length]
}

// 获取随机位置（在一定范围内）
const getRandomPosition = (index: number) => {
  const baseTop = Math.floor(index / 3) * 280 + 100
  const baseLeft = (index % 3) * 300 + 100
  const randomTop = baseTop + Math.random() * 50 - 25
  const randomLeft = baseLeft + Math.random() * 50 - 25
  return { top: `${randomTop}px`, left: `${randomLeft}px` }
}

// 格式化时间显示
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

// 组件挂载时获取留言
onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="whiteboard-container">
    <!-- 白板背景 -->
    <div class="whiteboard">
      <!-- 白板标题 -->
      <div class="whiteboard-header">
        <h1 class="whiteboard-title">📝 留言白板</h1>
        <button class="add-note-btn" @click="showForm = !showForm">
          {{ showForm ? '❌' : '➕' }} {{ showForm ? '取消' : '写便签' }}
        </button>
      </div>

      <!-- 错误和成功提示 -->
      <div v-if="errorMessage" class="floating-message error-toast">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="floating-message success-toast">
        {{ successMessage }}
      </div>

      <!-- 留言表单（浮动窗口） -->
      <div v-if="showForm" class="floating-form">
        <div class="form-content">
          <h3>✨ 写一张便签</h3>
          <form @submit.prevent="submitMessage">
            <input
              v-model="newMessage.nickname"
              type="text"
              placeholder="你的昵称"
              maxlength="50"
              class="form-input"
              required
            >
            <textarea
              v-model="newMessage.content"
              placeholder="想说些什么..."
              rows="4"
              maxlength="500"
              class="form-textarea"
              required
            />
            <div class="form-buttons">
              <button
                type="submit"
                class="submit-btn"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '📝 贴便签中...' : '📌 贴到白板' }}
              </button>
              <button type="button" class="cancel-btn" @click="showForm = false">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 便签显示区域 -->
      <div class="notes-area">
        <div v-if="messages.length === 0" class="empty-board">
          <div class="empty-icon">📋</div>
          <p>白板还很空呢...</p>
          <p>点击右上角添加第一张便签吧！</p>
        </div>
        
        <!-- 便签 -->
        <div
          v-for="(message, index) in messages"
          :key="message.id"
          class="sticky-note"
          :style="{
            backgroundColor: getNoteColor(index),
            ...getRandomPosition(index),
            zIndex: 1000 - index
          }"
          @click="handleNoteClick"
        >
          <!-- 删除按钮 -->
          <button
            class="delete-btn"
            :disabled="isDeleting"
            title="删除便签"
            @click.stop="deleteMessage(message.id)"
          >
            ❌
          </button>
          
          <!-- 便签内容 -->
          <div class="note-content">
            <div class="note-text">{{ message.content }}</div>
            <div class="note-footer">
              <div class="note-author">— {{ message.nickname }}</div>
              <div class="note-time">{{ formatTime(message.created_at) }}</div>
            </div>
          </div>
          
          <!-- 便签阴影效果 -->
          <div class="note-shadow"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.whiteboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
}

.whiteboard {
  width: 100%;
  height: 100vh;
  background: #ffffff;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  position: relative;
  overflow: auto;
}

/* 白板头部 */
.whiteboard-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.whiteboard-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.add-note-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.add-note-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 浮动消息提示 */
.floating-message {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.error-toast {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.success-toast {
  background: #c6f6d5;
  color: #2f855a;
  border: 1px solid #9ae6b4;
}

/* 浮动表单 */
.floating-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  animation: popUp 0.3s ease-out;
}

.form-content {
  padding: 2rem;
  min-width: 400px;
}

.form-content h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #2d3748;
  text-align: center;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.submit-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

/* 便签区域 */
.notes-area {
  padding-top: 120px;
  min-height: 100vh;
  position: relative;
}

/* 空白板提示 */
.empty-board {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #a0aec0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-board p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

/* 便签样式 */
.sticky-note {
  position: absolute;
  width: 250px;
  min-height: 200px;
  padding: 20px;
  border-radius: 10px 10px 0 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  transform: rotate(-1deg);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.sticky-note:nth-child(even) {
  transform: rotate(1deg);
}

.sticky-note:nth-child(3n) {
  transform: rotate(-0.5deg);
}

.sticky-note:hover {
  transform: rotate(0deg) scale(1.05);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 3px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999 !important;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ff6b6b;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1;
}

.sticky-note:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
}

/* 便签内容 */
.note-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.note-text {
  font-size: 14px;
  line-height: 1.5;
  color: #2d3748;
  margin-bottom: 1rem;
  word-wrap: break-word;
  flex-grow: 1;
}

.note-footer {
  border-top: 1px dashed rgba(0, 0, 0, 0.2);
  padding-top: 0.5rem;
  margin-top: auto;
}

.note-author {
  font-size: 12px;
  font-weight: bold;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.note-time {
  font-size: 11px;
  color: #718096;
}

/* 便签阴影效果 */
.note-shadow {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0 10px;
  z-index: -1;
  transform: rotate(1deg);
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes popUp {
  from {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .whiteboard-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .whiteboard-title {
    font-size: 1.25rem;
  }
  
  .form-content {
    min-width: 90vw;
    padding: 1.5rem;
  }
  
  .sticky-note {
    width: 200px;
    min-height: 180px;
    padding: 15px;
  }
  
  .floating-message {
    right: 10px;
    left: 10px;
    text-align: center;
  }
}
</style> 