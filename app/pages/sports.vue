<script setup lang="ts">
import { ref, onMounted } from 'vue'

const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''

const nickname = ref('')
const selectedUser = ref(null)
const users = ref([])
const sportTypes = ref([])
const duration = ref('')
const count = ref('')
const records = ref([])
const showRecords = ref(false)
const sportType = ref('')

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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('创建用户数据:', data)
    
    if (data.error) {
      alert(data.error)
      return
    }
    
    if (data.results?.[0]) {
      users.value.unshift(data.results[0])
      selectedUser.value = data.results[0]
      nickname.value = ''
    }
  } catch (error) {
    console.error('创建用户失败:', error)
    alert('创建用户失败，请重试')
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
  if (!sportType.value || !duration.value) {
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
        count: count.value ? parseInt(count.value) : null
      })
    })
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
    }
  } catch (error) {
    console.error('提交运动记录失败:', error)
    alert('提交运动记录失败，请重试')
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
    <h1 class="page-title">运动打卡</h1>

    <!-- 用户管理区域 -->
    <div class="section user-section">
      <h2>用户管理</h2>
      <div class="user-form">
        <input
          v-model="nickname"
          type="text"
          placeholder="输入昵称"
          class="input"
        >
        <button class="button" @click="createUser">创建用户</button>
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
      <h2>运动打卡</h2>
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

        <button class="button" @click="submitRecord">提交打卡</button>
      </div>
    </div>

    <!-- 查看记录按钮 -->
    <div v-if="selectedUser" class="section view-section">
      <button class="button view-button" @click="viewRecords">
        查看运动记录
      </button>
    </div>

    <!-- 记录列表 -->
    <div v-if="showRecords && records.length" class="section records-section">
      <h2>运动记录</h2>
      <div class="records-list">
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
        >
          <div class="record-content">
            <span class="sport-type">{{ getSportLabel(record.sport_type) }}</span>
            <span class="duration">{{ record.duration }}分钟</span>
            <span v-if="record.count" class="count">{{ record.count }}次</span>
            <span class="date">{{ formatDate(record.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRecords && !records.length" class="no-records">
      暂无运动记录
    </div>
  </div>
</template>

<style scoped>
.sports-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.user-form,
.record-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input,
.select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  flex: 1;
}

.button {
  padding: 0.5rem 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #357abd;
}

.view-button {
  width: 100%;
  margin-top: 1rem;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #4a90e2;
}

.record-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sport-type {
  font-weight: bold;
  color: #4a90e2;
}

.duration,
.count {
  color: #666;
}

.date {
  margin-left: auto;
  color: #999;
  font-size: 0.9rem;
}

.no-records {
  text-align: center;
  color: #666;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .user-form,
  .record-form {
    flex-direction: column;
  }

  .record-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .date {
    margin-left: 0;
  }
}
</style> 