<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SportType {
  id: number
  value: string
  label: string
  icon?: string
  description?: string
  created_at: string
}

const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''

const sportTypes = ref<SportType[]>([])
const showForm = ref(false)
const editingType = ref<SportType | null>(null)

// 表单数据
const formData = ref({
  value: '',
  label: '',
  icon: '',
  description: ''
})

// 获取所有运动类型
const fetchSportTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sport-types`)
    const data = await response.json()
    sportTypes.value = data.results || []
  } catch (error) {
    console.error('获取运动类型失败:', error)
  }
}

// 创建或更新运动类型
const saveSportType = async () => {
  if (!formData.value.value || !formData.value.label) {
    alert('请填写必要信息')
    return
  }

  try {
    const method = editingType.value ? 'PUT' : 'POST'
    const body = editingType.value
      ? { ...formData.value, id: editingType.value.id }
      : formData.value

    const response = await fetch(`${API_BASE_URL}/api/sport-types`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    
    if (data.error) {
      alert(data.error)
      return
    }

    if (data.results?.[0]) {
      if (editingType.value) {
        // 更新列表中的数据
        const index = sportTypes.value.findIndex(t => t.id === editingType.value?.id)
        if (index !== -1) {
          sportTypes.value[index] = data.results[0]
        }
      } else {
        // 添加新数据到列表
        sportTypes.value.unshift(data.results[0])
      }
      
      closeForm()
    }
  } catch (error) {
    console.error('保存运动类型失败:', error)
  }
}

// 删除运动类型
const deleteSportType = async (type: SportType) => {
  if (!confirm(`确定要删除运动类型"${type.label}"吗？`)) {
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/sport-types`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: type.id })
    })

    const data = await response.json()
    
    if (data.error) {
      alert(data.error)
      return
    }

    if (data.results?.[0]) {
      sportTypes.value = sportTypes.value.filter(t => t.id !== type.id)
    }
  } catch (error) {
    console.error('删除运动类型失败:', error)
  }
}

// 编辑运动类型
const editSportType = (type: SportType) => {
  editingType.value = type
  formData.value = {
    value: type.value,
    label: type.label,
    icon: type.icon || '',
    description: type.description || ''
  }
  showForm.value = true
}

// 打开创建表单
const openCreateForm = () => {
  editingType.value = null
  formData.value = {
    value: '',
    label: '',
    icon: '',
    description: ''
  }
  showForm.value = true
}

// 关闭表单
const closeForm = () => {
  showForm.value = false
  editingType.value = null
  formData.value = {
    value: '',
    label: '',
    icon: '',
    description: ''
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

onMounted(() => {
  fetchSportTypes()
})
</script>

<template>
  <div class="sport-types-page">
    <h1 class="page-title">运动类型管理</h1>

    <!-- 添加按钮 -->
    <div class="actions">
      <button class="button create-button" @click="openCreateForm">
        添加运动类型
      </button>
    </div>

    <!-- 运动类型列表 -->
    <div class="types-list">
      <div v-for="type in sportTypes" :key="type.id" class="type-item">
        <div class="type-content">
          <div class="type-header">
            <span class="type-label">{{ type.label }}</span>
            <span class="type-value">({{ type.value }})</span>
          </div>
          <div v-if="type.description" class="type-description">
            {{ type.description }}
          </div>
          <div class="type-meta">
            <span v-if="type.icon" class="type-icon">{{ type.icon }}</span>
            <span class="type-date">{{ formatDate(type.created_at) }}</span>
          </div>
        </div>
        <div class="type-actions">
          <button class="button edit-button" @click="editSportType(type)">
            编辑
          </button>
          <button class="button delete-button" @click="deleteSportType(type)">
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 表单弹窗 -->
    <div v-if="showForm" class="modal" @click.self="closeForm">
      <div class="modal-content">
        <h2>{{ editingType ? '编辑运动类型' : '添加运动类型' }}</h2>
        <div class="form">
          <div class="form-group">
            <label>标识符</label>
            <input
              v-model="formData.value"
              type="text"
              placeholder="输入英文标识符，如：running"
              :disabled="!!editingType"
            >
          </div>
          <div class="form-group">
            <label>名称</label>
            <input
              v-model="formData.label"
              type="text"
              placeholder="输入中文名称，如：跑步"
            >
          </div>
          <div class="form-group">
            <label>图标（可选）</label>
            <input
              v-model="formData.icon"
              type="text"
              placeholder="输入图标，如：🏃"
            >
          </div>
          <div class="form-group">
            <label>描述（可选）</label>
            <textarea
              v-model="formData.description"
              placeholder="输入运动类型描述"
            />
          </div>
          <div class="form-actions">
            <button class="button cancel-button" @click="closeForm">
              取消
            </button>
            <button class="button save-button" @click="saveSportType">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sport-types-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.actions {
  margin-bottom: 2rem;
  text-align: right;
}

.create-button {
  background-color: #42b983;
}

.types-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.type-content {
  flex: 1;
}

.type-header {
  margin-bottom: 0.5rem;
}

.type-label {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

.type-value {
  color: #666;
  margin-left: 0.5rem;
}

.type-description {
  color: #666;
  margin-bottom: 0.5rem;
}

.type-meta {
  font-size: 0.9rem;
  color: #999;
}

.type-icon {
  margin-right: 1rem;
}

.type-actions {
  display: flex;
  gap: 0.5rem;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  opacity: 0.9;
}

.edit-button {
  background-color: #4a90e2;
}

.delete-button {
  background-color: #e74c3c;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  background-color: #95a5a6;
}

.save-button {
  background-color: #42b983;
}

@media (max-width: 640px) {
  .type-item {
    flex-direction: column;
    align-items: stretch;
  }

  .type-actions {
    margin-top: 1rem;
    justify-content: flex-end;
  }
}
</style> 