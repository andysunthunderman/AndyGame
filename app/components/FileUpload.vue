<template>
  <div class="file-upload-container">
    <h3>文件上传示例</h3>
    
    <!-- 上传区域 -->
    <div class="upload-area" :class="{ 'drag-over': isDragOver }" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave">
      <input ref="fileInput" type="file" style="display: none" accept="image/*,audio/*,.json,.txt" @change="handleFileSelect">
      
      <div v-if="!uploading && !uploadedFile" class="upload-prompt">
        <div class="upload-icon">📁</div>
        <p>点击或拖拽文件到此处上传</p>
        <p class="file-types">支持图片、音频、JSON、文本文件</p>
      </div>
      
      <div v-if="uploading" class="uploading">
        <div class="spinner"/>
        <p>正在上传 {{ selectedFile?.name }}...</p>
      </div>
      
      <div v-if="uploadedFile" class="upload-success">
        <div class="success-icon">✅</div>
        <p>上传成功！</p>
        <p class="file-info">{{ uploadedFile.fileName }} ({{ formatFileSize(uploadedFile.fileSize) }})</p>
        <div class="file-actions">
          <button class="view-btn" @click="viewFile">查看文件</button>
          <button class="copy-btn" @click="copyUrl">复制链接</button>
          <button class="reset-btn" @click="resetUpload">重新上传</button>
        </div>
      </div>
    </div>
    
    <!-- 分类选择 -->
    <div class="category-selector">
      <label>文件分类：</label>
      <select v-model="selectedCategory">
        <option value="images">图片资源</option>
        <option value="audio">音频文件</option>
        <option value="documents">文档文件</option>
        <option value="avatars">用户头像</option>
        <option value="game-assets">游戏资源</option>
        <option value="general">其他文件</option>
      </select>
    </div>
    
    <!-- 自定义文件名 -->
    <div class="custom-name">
      <label>自定义文件名（可选）：</label>
      <input v-model="customFileName" type="text" placeholder="留空则自动生成">
    </div>
    
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <!-- 已上传文件列表 -->
    <div v-if="showFileList" class="file-list">
      <h4>已上传的文件 <button class="refresh-btn" @click="refreshFileList">🔄</button></h4>
      <div class="admin-controls">
        <input v-model="adminKey" type="password" placeholder="输入管理员密钥以启用删除功能" >
      </div>
      <div v-if="loadingFiles" class="loading">加载中...</div>
      <div v-else-if="fileList.length === 0" class="no-files">暂无文件</div>
      <div v-else class="files">
        <div v-for="file in fileList" :key="file.key" class="file-item">
          <div class="file-info">
            <strong>{{ file.fileName }}</strong>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-category">{{ file.category }}</span>
            <div class="file-key">{{ file.key }}</div>
          </div>
          <div class="file-actions">
            <a :href="file.url" target="_blank" class="view-link">👁️ 查看</a>
            <button class="copy-btn" @click="copyFileUrl(file.url)">📋 复制</button>
            <button 
              v-if="adminKey" 
              class="delete-btn" 
              :disabled="deletingFiles.has(file.key)"
              @click="deleteFile(file.key)"
            >
              {{ deletingFiles.has(file.key) ? '删除中...' : '🗑️ 删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 类型定义
interface UploadedFile {
  key: string
  url: string
  fileName: string
  fileSize: number
  fileType: string
  category: string
  uploadTime: string
}

interface FileListItem {
  key: string
  size: number
  url: string
  fileName: string
  category: string
}

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadedFile = ref<UploadedFile | null>(null)
const errorMessage = ref('')
const isDragOver = ref(false)
const selectedCategory = ref('general')
const customFileName = ref('')
const showFileList = ref(true)
const fileList = ref<FileListItem[]>([])
const loadingFiles = ref(false)

// 删除功能相关
const adminKey = ref('')
const deletingFiles = ref(new Set<string>())

// API基础URL
const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''

// 文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    uploadFile()
  }
}

// 拖拽处理
const handleDragOver = (_event: DragEvent) => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
    uploadFile()
  }
}

// 文件上传
const uploadFile = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  errorMessage.value = ''
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('category', selectedCategory.value)
    if (customFileName.value) {
      formData.append('name', customFileName.value)
    }
    
    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      uploadedFile.value = result.data
      selectedFile.value = null
      refreshFileList()
    } else {
      errorMessage.value = result.error || '上传失败'
    }
  } catch (error) {
    console.error('上传错误:', error)
    errorMessage.value = '上传失败，请检查网络连接'
  } finally {
    uploading.value = false
  }
}

// 查看文件
const viewFile = () => {
  if (uploadedFile.value?.url) {
    window.open(uploadedFile.value.url, '_blank')
  }
}

// 复制链接
const copyUrl = async () => {
  if (uploadedFile.value?.url) {
    try {
      await navigator.clipboard.writeText(uploadedFile.value.url)
      alert('链接已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动复制')
    }
  }
}

// 重置上传
const resetUpload = () => {
  uploadedFile.value = null
  selectedFile.value = null
  errorMessage.value = ''
  customFileName.value = ''
}

// 复制文件链接
const copyFileUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}

// 获取文件列表
const refreshFileList = async () => {
  loadingFiles.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/list?limit=20`)
    const result = await response.json()
    
    if (result.success) {
      fileList.value = result.data.files
    } else {
      console.error('获取文件列表失败:', result.error)
    }
  } catch (error) {
    console.error('获取文件列表错误:', error)
  } finally {
    loadingFiles.value = false
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

// 删除文件
const deleteFile = async (fileKey: string) => {
  if (!adminKey.value) {
    alert('请先输入管理员密钥')
    return
  }
  
  if (!confirm(`确定要删除文件 "${fileKey}" 吗？此操作不可恢复！`)) {
    return
  }
  
  deletingFiles.value.add(fileKey)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileKey: fileKey,
        adminKey: adminKey.value
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 从列表中移除已删除的文件
      fileList.value = fileList.value.filter(file => file.key !== fileKey)
      alert('文件删除成功')
    } else {
      alert('删除失败: ' + result.error)
    }
  } catch (error) {
    alert('删除失败: ' + error)
  } finally {
    deletingFiles.value.delete(fileKey)
  }
}

// 组件挂载时获取文件列表
onMounted(() => {
  refreshFileList()
})
</script>

<style scoped>
.file-upload-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.upload-area:hover, .upload-area.drag-over {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.upload-prompt .upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-prompt p {
  margin: 5px 0;
  color: #666;
}

.file-types {
  font-size: 12px;
  color: #999;
}

.uploading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-success {
  color: #28a745;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.file-info {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
}

.file-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.file-actions button, .file-actions a {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
}

.view-btn, .view-link {
  background-color: #007bff;
  color: white;
}

.copy-btn {
  background-color: #6c757d;
  color: white;
}

.reset-btn {
  background-color: #dc3545;
  color: white;
}

.category-selector, .custom-name {
  margin-bottom: 15px;
}

.category-selector label, .custom-name label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.category-selector select, .custom-name input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.file-list {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.file-list h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.loading, .no-files {
  text-align: center;
  color: #666;
  padding: 20px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  margin-bottom: 10px;
}

.file-item .file-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.file-size, .file-category {
  font-size: 12px;
  color: #666;
}

.file-item .file-actions {
  display: flex;
  gap: 5px;
  margin: 0;
}

.file-item .file-actions button,
.file-item .file-actions a {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.file-item .file-actions .view-link {
  background: linear-gradient(45deg, #4299e1, #3182ce);
  color: white;
}

.file-item .file-actions .copy-btn {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
}

.file-item .file-actions .delete-btn {
  background: linear-gradient(45deg, #e53e3e, #c53030);
  color: white;
}

.file-item .file-actions button:hover:not(:disabled),
.file-item .file-actions a:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.file-item .file-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.admin-controls {
  margin-bottom: 15px;
}

.admin-controls input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.3s ease;
}

.admin-controls input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.file-key {
  font-family: monospace;
  font-size: 11px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  word-break: break-all;
}
</style> 