<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SportType {
  value: string
  label: string
}

interface User {
  id: number
  nickname: string
  created_at: string
}

interface SportRecord {
  id: number
  user_id: number
  sport_type: string
  duration: number
  count: number | null
  exercise_time: string
  check_in_time: string
  created_at: string
}

const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''

const nickname = ref('')
const selectedUser = ref<User | null>(null)
const users = ref<User[]>([])
const sportTypes = ref<SportType[]>([])
const duration = ref('')
const count = ref('')
const records = ref<SportRecord[]>([])
const showRecords = ref(false)
const sportType = ref('')
const exerciseTime = ref('')

// 获取所有用户
const fetchUsers = async () => {
  try {
    console.log('正在获取用户列表...')
    const response = await fetch(`${API_BASE_URL}/api/sports/users`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    console.log('用户列表响应:', response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('用户列表数据:', data)
    users.value = data.results || []
  } catch (error) {
    console.error('获取用户失败:', error)
  }
}

// 创建新用户
const createUser = async () => {
  if (!nickname.value) {
    alert('请输入昵称')
    return
  }

  try {
    console.log('正在创建用户...')
    const response = await fetch(`${API_BASE_URL}/api/sports/users`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nickname: nickname.value })
    })
    console.log('创建用户响应:', response)
    
    const data = await response.json()
    console.log('创建用户数据:', data)
    
    if (!response.ok) {
      const errorMessage = data.statusMessage || data.data?.details || `HTTP error! status: ${response.status}`
      alert(`创建用户失败: ${errorMessage}`)
      return
    }
    
    if (data.error) {
      alert(data.error)
      return
    }
    
    if (data.results?.[0]) {
      users.value.unshift(data.results[0])
      selectedUser.value = data.results[0]
      nickname.value = ''
    } else {
      alert('创建用户成功，但返回数据格式异常')
    }
  } catch (error) {
    console.error('创建用户失败:', error)
    alert(`创建用户失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 获取用户的运动记录
const viewRecords = async () => {
  if (!selectedUser.value) {
    alert('请先选择用户')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/sports/records?userId=${selectedUser.value.id}`)
    const data = await response.json()
    records.value = data.results || []
    showRecords.value = true
  } catch (error) {
    console.error('获取运动记录失败:', error)
  }
}

// 提交运动记录
const submitRecord = async () => {
  if (!selectedUser.value) {
    alert('请先选择用户')
    return
  }
  if (!sportType.value || !duration.value || !exerciseTime.value) {
    alert('请填写必要信息')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/sports/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUser.value.id,
        sportType: sportType.value,
        duration: parseInt(duration.value),
        count: count.value ? parseInt(count.value) : null,
        exerciseTime: exerciseTime.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      const errorMessage = data.statusMessage || data.data?.details || `HTTP error! status: ${response.status}`
      alert(`提交运动记录失败: ${errorMessage}`)
      return
    }

    const data = await response.json()
    
    if (data.error) {
      alert(data.error)
      return
    }
    
    if (data.results?.[0]) {
      alert('打卡成功！')
      sportType.value = ''
      duration.value = ''
      count.value = ''
      exerciseTime.value = ''
      // 刷新记录列表
      if (selectedUser.value) {
        viewRecords()
      }
    } else {
      alert('提交成功，但返回数据格式异常')
    }
  } catch (error) {
    console.error('提交运动记录失败:', error)
    alert(`提交运动记录失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 格式化时间
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取运动类型标签
const getSportLabel = (value: string) => {
  return sportTypes.value.find(type => type.value === value)?.label || value
}

// 获取所有运动类型
const fetchSportTypes = async () => {
  try {
    console.log('正在获取运动类型...')
    const response = await fetch(`${API_BASE_URL}/api/sport-types`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    console.log('运动类型响应:', response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('运动类型数据:', data)
    sportTypes.value = data.results || []
  } catch (error) {
    console.error('获取运动类型失败:', error)
  }
}

onMounted(() => {
  fetchUsers()
  fetchSportTypes()
})
</script>

<template>
  <div class="sports-page">
    <!-- 装饰性背景 -->
    <div class="background-decoration">
      <div class="floating-icon" style="--delay: 0s; --x: 10%; --y: 20%;">🏃‍♂️</div>
      <div class="floating-icon" style="--delay: 1s; --x: 85%; --y: 30%;">🏋️‍♀️</div>
      <div class="floating-icon" style="--delay: 2s; --x: 15%; --y: 70%;">⚽</div>
      <div class="floating-icon" style="--delay: 3s; --x: 80%; --y: 60%;">🏀</div>
      <div class="floating-icon" style="--delay: 4s; --x: 50%; --y: 15%;">🏊‍♂️</div>
    </div>

    <div class="container">
      <h1 class="page-title">运动打卡</h1>

      <!-- 用户管理区域 -->
      <div class="section user-section">
        <h2>🙋‍♂️ 用户管理</h2>
        <div class="user-form">
          <input
            v-model="nickname"
            type="text"
            placeholder="输入昵称"
            class="input"
          >
          <button class="button primary-btn" @click="createUser">创建用户</button>
        </div>

        <div class="user-select">
          <select
            v-model="selectedUser"
            class="select"
          >
            <option :value="null">请选择用户</option>
            <option
              v-for="user in users"
              :key="user.id"
              :value="user"
            >
              {{ user.nickname }}
            </option>
          </select>
        </div>
      </div>

      <!-- 打卡区域 -->
      <div v-if="selectedUser" class="section record-section">
        <h2>💪 运动打卡</h2>
        <div class="record-form">
          <select
            v-model="sportType"
            class="select"
          >
            <option value="">选择运动项目</option>
            <option
              v-for="type in sportTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>

          <input
            v-model="duration"
            type="number"
            placeholder="运动时长（分钟）"
            class="input"
          >

          <input
            v-model="count"
            type="number"
            placeholder="运动次数/个数（可选）"
            class="input"
          >

          <input
            v-model="exerciseTime"
            type="datetime-local"
            class="input"
            placeholder="运动时间"
          >

          <button class="button success-btn" @click="submitRecord">✨ 提交打卡</button>
        </div>
      </div>

      <!-- 查看记录按钮 -->
      <div v-if="selectedUser" class="section view-section">
        <button class="button view-button" @click="viewRecords">
          📊 查看运动记录
        </button>
      </div>

      <!-- 运动记录列表 -->
      <div v-if="showRecords && selectedUser" class="section records-section">
        <h2>📝 运动记录</h2>
        <div class="records-list">
          <div v-if="records.length === 0" class="no-records">
            暂无运动记录
          </div>
          <div v-else class="record-items">
            <div v-for="record in records" :key="record.id" class="record-item">
              <div class="record-header">
                <span class="sport-type">{{ getSportLabel(record.sport_type) }}</span>
                <span class="record-time">运动时间：{{ formatDate(record.exercise_time) }}</span>
              </div>
              <div class="record-details">
                <span class="duration">⏱️ {{ record.duration }}分钟</span>
                <span v-if="record.count" class="count">🔢 {{ record.count }}次</span>
              </div>
              <div class="record-footer">
                <span class="check-in-time">打卡时间：{{ formatDate(record.check_in_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sports-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-icon {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  animation-delay: var(--delay);
  left: var(--x);
  top: var(--y);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.container {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  text-align: center;
  color: #ffffff;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from { 
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); 
    color: #ffffff;
  }
  to { 
    text-shadow: 0 4px 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6); 
    color: #f7fafc;
  }
}

.section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.section:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.section h2 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-form,
.record-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.input,
.select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  flex: 1;
  min-width: 200px;
  transition: all 0.3s ease;
  background: white;
  color: #2d3748;
}

.input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.select option {
  color: #2d3748;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: #5a67d8;
  box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.15);
  transform: translateY(-2px);
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.button:hover::before {
  left: 100%;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.primary-btn {
  background: linear-gradient(45deg, #4299e1, #5a67d8);
  color: white;
}

.success-btn {
  background: linear-gradient(45deg, #48bb78, #38b2ac);
  color: white;
}

.view-button {
  width: 100%;
  background: linear-gradient(45deg, #ed8936, #f56500);
  color: white;
  margin-top: 1rem;
}

.records-section {
  margin-top: 2rem;
}

.records-list {
  margin-top: 1rem;
}

.no-records {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
}

.record-items {
  display: grid;
  gap: 1rem;
}

.record-item {
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid #5a67d8;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.record-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #5a67d8, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.record-item:hover::before {
  transform: scaleX(1);
}

.record-item:hover {
  transform: translateX(10px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sport-type {
  font-weight: bold;
  color: #5a67d8;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(90, 103, 216, 0.2);
}

.record-time {
  color: #4a5568;
  font-size: 0.9rem;
}

.record-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.duration,
.count {
  color: #2d3748;
  font-weight: 600;
  background: rgba(90, 103, 216, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.record-footer {
  color: #4a5568;
  font-size: 0.85rem;
  font-style: italic;
}

.input[type="datetime-local"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 10px;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .user-form,
  .record-form {
    flex-direction: column;
  }
  
  .input,
  .select {
    min-width: auto;
  }

  .record-header,
  .record-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .floating-icon {
    font-size: 1.5rem;
  }
}
</style> 