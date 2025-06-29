<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'game'
})

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
  image_url?: string
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

// 图片上传相关
const selectedImage = ref<File | null>(null)
const uploadingImage = ref(false)
const uploadedImageUrl = ref('')
const uploadError = ref('')
const imagePreviewUrl = ref('')
const imageInput = ref<HTMLInputElement>()

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

  console.log('提交前的表单数据:', {
    sportType: sportType.value,
    duration: duration.value,
    exerciseTime: exerciseTime.value,
    count: count.value,
    hasImage: !!selectedImage.value
  })

  const missingFields = []
  if (!sportType.value) missingFields.push('运动项目')
  if (!duration.value) missingFields.push('运动时长')
  if (!exerciseTime.value) missingFields.push('运动时间')

  if (missingFields.length > 0) {
    alert(`请填写以下必要信息：${missingFields.join('、')}`)
    return
  }

  try {
    // 如果有选择图片，先上传图片
    let imageUrl = ''
    if (selectedImage.value) {
      imageUrl = await uploadImage() || ''
      if (uploadError.value) {
        alert(`图片上传失败: ${uploadError.value}`)
        return
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/sports/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUser.value.id,
        sportType: sportType.value,
        duration: parseInt(duration.value),
        count: count.value ? parseInt(count.value) : null,
        exerciseTime: exerciseTime.value,
        imageUrl: imageUrl
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
      removeImage() // 清除图片
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

// 设置默认运动时间为当前时间
const setDefaultExerciseTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  exerciseTime.value = `${year}-${month}-${day}T${hours}:${minutes}`
}

// 图片上传相关函数
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      uploadError.value = '请选择图片文件'
      return
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      uploadError.value = '图片大小不能超过5MB'
      return
    }
    
    selectedImage.value = file
    uploadError.value = ''
    
    // 创建预览URL
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
    }
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

const uploadImage = async () => {
  if (!selectedImage.value) return null
  
  uploadingImage.value = true
  uploadError.value = ''
  
  try {
    const formData = new FormData()
    formData.append('file', selectedImage.value)
    formData.append('category', 'sports')
    
    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      uploadedImageUrl.value = result.data.url
      return result.data.url
    } else {
      uploadError.value = result.error || '图片上传失败'
      return null
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    uploadError.value = '图片上传失败，请检查网络连接'
    return null
  } finally {
    uploadingImage.value = false
  }
}

const removeImage = () => {
  selectedImage.value = null
  uploadedImageUrl.value = ''
  uploadError.value = ''
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = ''
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  fetchUsers()
  fetchSportTypes()
  setDefaultExerciseTime()
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
            :max="new Date().toISOString().slice(0, 16)"
            @click="exerciseTime === '' && setDefaultExerciseTime()"
          >

          <!-- 图片上传区域 -->
          <div class="image-upload-section">
            <h3>📸 运动照片（可选）</h3>
            
            <div v-if="!selectedImage && !imagePreviewUrl" class="upload-area" @click="imageInput?.click()">
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageSelect"
              >
              <div class="upload-icon">🖼️</div>
              <p>点击选择运动照片</p>
              <p class="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</p>
            </div>

            <div v-if="imagePreviewUrl" class="image-preview">
              <img :src="imagePreviewUrl" alt="运动照片预览" class="preview-image">
              <div class="image-info">
                <p>{{ selectedImage?.name }}</p>
                <p class="file-size">{{ selectedImage ? formatFileSize(selectedImage.size) : '' }}</p>
              </div>
              <div class="image-actions">
                <button type="button" class="button danger-btn" @click="removeImage">
                  🗑️ 删除
                </button>
                <button type="button" class="button secondary-btn" @click="imageInput?.click()">
                  🔄 重新选择
                </button>
              </div>
            </div>

            <div v-if="uploadingImage" class="uploading-status">
              <div class="spinner"/>
              <p>正在上传图片...</p>
            </div>

            <div v-if="uploadError" class="error-message">
              {{ uploadError }}
            </div>
          </div>

          <button class="button success-btn" :disabled="uploadingImage" @click="submitRecord">
            {{ uploadingImage ? '上传中...' : '✨ 提交打卡' }}
          </button>
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
              <div v-if="record.image_url" class="record-image">
                <img :src="record.image_url" alt="运动照片" class="sport-image" @error="(e) => (e.target as HTMLImageElement).style.display='none'">
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

/* 图片上传样式 */
.image-upload-section {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 2px dashed #e2e8f0;
  border-radius: 10px;
  background: rgba(247, 250, 252, 0.5);
}

.image-upload-section h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
}

.upload-area {
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #5a67d8;
  background-color: #f7fafc;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #5a67d8;
}

.upload-area p {
  margin: 0.5rem 0;
  color: #4a5568;
  font-weight: 600;
}

.upload-hint {
  font-size: 0.85rem !important;
  color: #a0aec0 !important;
  font-weight: 400 !important;
}

.image-preview {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.image-info p {
  margin: 0.25rem 0;
  color: #4a5568;
}

.file-size {
  font-size: 0.85rem;
  color: #718096;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.danger-btn {
  background: linear-gradient(45deg, #e53e3e, #c53030);
  color: white;
}

.secondary-btn {
  background: linear-gradient(45deg, #718096, #4a5568);
  color: white;
}

.uploading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #5a67d8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: rgba(254, 178, 178, 0.2);
  color: #e53e3e;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(229, 62, 62, 0.3);
  margin-top: 0.5rem;
  font-weight: 600;
}

/* 运动记录中的图片显示 */
.record-image {
  margin: 1rem 0;
}

.sport-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.sport-image:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
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