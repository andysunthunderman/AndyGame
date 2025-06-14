<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义留言类型
interface Message {
  id: number
  nickname: string
  content: string
  created_at: string
}

// 留言板API客户端
const messageApi = {
  async getAllMessages(): Promise<Message[]> {
    const response = await fetch('/api/messages')
    if (!response.ok) {
      throw new Error(`获取留言失败: HTTP ${response.status}`)
    }
    const data = await response.json()
    return data.messages || []
  },
  
  async createMessage(nickname: string, content: string): Promise<void> {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname, content }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `提交失败: HTTP ${response.status}`)
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

// 组件挂载时获取留言
onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="message-board">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <h1 class="text-3xl font-bold text-center mb-8">留言板</h1>
      
      <!-- 留言表单 -->
      <div class="message-form">
        <h2 class="text-xl font-semibold mb-4">发表留言</h2>
        
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <!-- 成功提示 -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <form class="space-y-4" @submit.prevent="submitMessage">
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700">
              昵称
            </label>
            <input
              id="nickname"
              v-model="newMessage.nickname"
              type="text"
              class="message-input"
              placeholder="请输入您的昵称"
              maxlength="50"
            >
          </div>
          
          <div>
            <label for="content" class="block text-sm font-medium text-gray-700">
              留言内容
            </label>
            <textarea
              id="content"
              v-model="newMessage.content"
              class="message-textarea"
              placeholder="请输入留言内容"
              rows="4"
              maxlength="500"
            />
          </div>
          
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '发表留言' }}
          </button>
        </form>
      </div>
      
      <!-- 留言列表 -->
      <div class="messages-list">
        <h2 class="text-xl font-semibold mb-4">所有留言</h2>
        
        <div v-if="messages.length === 0" class="no-messages">
          暂无留言，来发表第一条留言吧！
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="message in messages" :key="message.id" class="message-item">
            <div class="message-header">
              <span class="nickname">{{ message.nickname }}</span>
              <span class="time">{{ message.created_at }}</span>
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-board {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 800px;
}

.message-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.message-input,
.message-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.message-input:focus,
.message-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #357abd;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.messages-list {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.message-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.nickname {
  font-weight: bold;
  color: #4a90e2;
}

.time {
  font-size: 0.875rem;
  color: #6b7280;
}

.message-content {
  color: #374151;
  line-height: 1.5;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.success-message {
  background-color: #dcfce7;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.no-messages {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
  
  .message-form,
  .messages-list {
    padding: 1rem;
  }
}
</style> 