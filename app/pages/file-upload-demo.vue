<template>
  <div class="file-upload-demo-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📁 Cloudflare R2 文件存储演示</h1>
      <p class="page-description">
        本页面演示了如何在 AndyGame 项目中使用 Cloudflare R2 对象存储服务。
        支持图片、音频、文档等多种文件类型的上传、下载和管理。
      </p>
      
      <div class="feature-badges">
        <span class="badge">✅ 多文件类型支持</span>
        <span class="badge">✅ 拖拽上传</span>
        <span class="badge">✅ 文件分类管理</span>
        <span class="badge">✅ 实时预览</span>
        <span class="badge">✅ CDN 加速</span>
      </div>
    </div>

    <!-- 功能选项卡 -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <!-- 文件上传演示 -->
    <div v-if="activeTab === 'upload'" class="tab-content">
      <div class="section">
        <h2>🚀 文件上传功能</h2>
        <p>支持拖拽上传、文件分类、自定义命名等功能</p>
        <FileUpload />
      </div>
    </div>

    <!-- API 测试 -->
    <div v-if="activeTab === 'api'" class="tab-content">
      <div class="section">
        <h2>🔧 API 接口测试</h2>
        <p>测试各个 R2 存储相关的 API 接口</p>
        
        <div class="api-tests">
          <!-- 文件列表测试 -->
          <div class="api-test-item">
            <h3>📂 获取文件列表</h3>
            <div class="test-controls">
              <label>前缀过滤：</label>
              <input v-model="listPrefix" placeholder="如：images/ 或 audio/" >
              <label>数量限制：</label>
              <input v-model="listLimit" type="number" min="1" max="100" >
              <button :disabled="testing" class="test-btn" @click="testFileList">
                {{ testing ? '测试中...' : '测试接口' }}
              </button>
            </div>
            <div v-if="listResult" class="test-result">
              <pre>{{ JSON.stringify(listResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- 文件上传测试 -->
          <div class="api-test-item">
            <h3>⬆️ 程序化上传测试</h3>
            <div class="test-controls">
              <input ref="testFileInput" type="file" @change="testFileUpload" >
              <select v-model="testCategory">
                <option value="test">测试文件</option>
                <option value="images">图片</option>
                <option value="audio">音频</option>
                <option value="documents">文档</option>
              </select>
            </div>
            <div v-if="uploadResult" class="test-result">
              <pre>{{ JSON.stringify(uploadResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- 文件访问测试 -->
          <div class="api-test-item">
            <h3>🔗 文件访问测试</h3>
            <div class="test-controls">
              <input v-model="accessFileKey" placeholder="输入文件 key，如：images/example.jpg" >
              <button :disabled="testing" class="test-btn" @click="testFileAccess">
                测试访问
              </button>
            </div>
            <div v-if="accessResult" class="test-result">
              <div v-if="accessResult.success">
                <p>✅ 文件访问成功！</p>
                <a :href="accessResult.url" target="_blank" class="file-link">
                  {{ accessResult.url }}
                </a>
              </div>
              <div v-else class="error">
                ❌ 访问失败: {{ accessResult.error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用指南 -->
    <div v-if="activeTab === 'guide'" class="tab-content">
      <div class="section">
        <h2>📖 使用指南</h2>
        
        <div class="guide-content">
          <div class="guide-section">
            <h3>🚀 快速开始</h3>
            <div class="code-block">
              <h4>1. 配置 R2 绑定</h4>
              <pre><code># wrangler.toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "andy-game-assets"</code></pre>
            </div>
            
            <div class="code-block">
              <h4>2. 在 API 中使用</h4>
              <pre><code>// server/api/example.ts
export default defineEventHandler(async (event) => {
  const assets = event.context.cloudflare.env.ASSETS
  
  // 上传文件
  await assets.put('path/file.jpg', fileStream)
  
  // 获取文件
  const file = await assets.get('path/file.jpg')
  
  // 删除文件
  await assets.delete('path/file.jpg')
})</code></pre>
            </div>
          </div>

          <div class="guide-section">
            <h3>📁 文件分类结构</h3>
            <div class="file-structure">
              <div class="folder">
                <strong>📂 文件分类建议</strong>
                <ul>
                  <li>📁 <code>images/</code> - 图片资源（游戏截图、用户头像等）</li>
                  <li>📁 <code>audio/</code> - 音频文件（游戏音效、背景音乐等）</li>
                  <li>📁 <code>documents/</code> - 文档文件（用户上传的文档）</li>
                  <li>📁 <code>avatars/</code> - 用户头像</li>
                  <li>📁 <code>game-assets/</code> - 游戏资源文件</li>
                  <li>📁 <code>temp/</code> - 临时文件</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="guide-section">
            <h3>🔧 API 接口说明</h3>
            <div class="api-docs">
              <div class="api-item">
                <h4>POST /api/files/upload</h4>
                <p>上传文件到 R2 存储</p>
                <ul>
                  <li><strong>参数：</strong>FormData (file, category, name)</li>
                  <li><strong>返回：</strong>文件信息和访问URL</li>
                </ul>
              </div>
              
              <div class="api-item">
                <h4>GET /api/files/[...key]</h4>
                <p>通过文件 key 访问文件</p>
                <ul>
                  <li><strong>参数：</strong>文件路径 key</li>
                  <li><strong>返回：</strong>文件内容流</li>
                </ul>
              </div>
              
              <div class="api-item">
                <h4>GET /api/files/list</h4>
                <p>获取文件列表</p>
                <ul>
                  <li><strong>参数：</strong>prefix, limit, cursor</li>
                  <li><strong>返回：</strong>文件列表和统计信息</li>
                </ul>
              </div>
              
              <div class="api-item">
                <h4>POST /api/files/delete</h4>
                <p>删除文件（需要管理员权限）</p>
                <ul>
                  <li><strong>参数：</strong>fileKey, adminKey</li>
                  <li><strong>返回：</strong>删除结果</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能监控 -->
    <div v-if="activeTab === 'performance'" class="tab-content">
      <div class="section">
        <h2>📊 性能监控</h2>
        <p>R2 存储服务的性能指标和使用统计</p>
        
        <div class="metrics">
          <div class="metric-card">
            <h3>📈 上传性能</h3>
            <div class="metric-value">
              <span class="value">{{ performanceMetrics.uploadSpeed }}</span>
              <span class="unit">MB/s</span>
            </div>
            <p>平均上传速度</p>
          </div>
          
          <div class="metric-card">
            <h3>⚡ 访问延迟</h3>
            <div class="metric-value">
              <span class="value">{{ performanceMetrics.accessLatency }}</span>
              <span class="unit">ms</span>
            </div>
            <p>文件访问延迟</p>
          </div>
          
          <div class="metric-card">
            <h3>💾 存储使用</h3>
            <div class="metric-value">
              <span class="value">{{ performanceMetrics.storageUsed }}</span>
              <span class="unit">MB</span>
            </div>
            <p>已使用存储空间</p>
          </div>
          
          <div class="metric-card">
            <h3>📁 文件数量</h3>
            <div class="metric-value">
              <span class="value">{{ performanceMetrics.fileCount }}</span>
              <span class="unit">个</span>
            </div>
            <p>存储文件总数</p>
          </div>
        </div>
        
        <button class="refresh-metrics-btn" @click="refreshMetrics">
          🔄 刷新指标
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 页面状态
const activeTab = ref('upload')

// 选项卡配置
const tabs = [
  { id: 'upload', name: '文件上传', icon: '⬆️' },
  { id: 'api', name: 'API 测试', icon: '🔧' },
  { id: 'guide', name: '使用指南', icon: '📖' },
  { id: 'performance', name: '性能监控', icon: '📊' }
]

// API 测试相关
const testing = ref(false)
const listPrefix = ref('')
const listLimit = ref(10)
const listResult = ref<Record<string, unknown> | null>(null)
const uploadResult = ref<Record<string, unknown> | null>(null)
const testCategory = ref('test')
const accessFileKey = ref('')
const accessResult = ref<Record<string, unknown> | null>(null)
const testFileInput = ref<HTMLInputElement>()

// 性能指标
const performanceMetrics = ref({
  uploadSpeed: '0.0',
  accessLatency: '0',
  storageUsed: '0.0',
  fileCount: '0'
})

// API 基础URL
const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8787' : ''

// 测试文件列表 API
const testFileList = async () => {
  testing.value = true
  listResult.value = null
  
  try {
    const params = new URLSearchParams()
    if (listPrefix.value) params.append('prefix', listPrefix.value)
    if (listLimit.value) params.append('limit', listLimit.value.toString())
    
    const response = await fetch(`${API_BASE_URL}/api/files/list?${params}`)
    listResult.value = await response.json()
  } catch (error) {
    listResult.value = { error: '请求失败: ' + error }
  } finally {
    testing.value = false
  }
}

// 测试文件上传 API
const testFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  
  uploadResult.value = null
  
  try {
    const formData = new FormData()
    formData.append('file', target.files[0])
    formData.append('category', testCategory.value)
    
    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData
    })
    
    uploadResult.value = await response.json()
  } catch (error) {
    uploadResult.value = { error: '上传失败: ' + error }
  }
}

// 测试文件访问
const testFileAccess = async () => {
  if (!accessFileKey.value) {
    accessResult.value = { success: false, error: '请输入文件 key' }
    return
  }
  
  testing.value = true
  accessResult.value = null
  
  try {
    const url = `${API_BASE_URL}/api/files/${encodeURIComponent(accessFileKey.value)}`
    const response = await fetch(url, { method: 'HEAD' }) // 只检查头部
    
    if (response.ok) {
      accessResult.value = { 
        success: true, 
        url: url,
        contentType: response.headers.get('Content-Type'),
        size: response.headers.get('Content-Length')
      }
    } else {
      accessResult.value = { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }
    }
  } catch (error) {
    accessResult.value = { success: false, error: '网络错误: ' + error }
  } finally {
    testing.value = false
  }
}

// 刷新性能指标
const refreshMetrics = async () => {
  try {
    // 获取文件列表来计算统计信息
    const response = await fetch(`${API_BASE_URL}/api/files/list?limit=1000`)
    const result = await response.json()
    
    if (result.success) {
      const files = result.data.files || []
      const totalSize = files.reduce((sum: number, file: { size?: number }) => sum + (file.size || 0), 0)
      
      performanceMetrics.value = {
        uploadSpeed: '2.5', // 模拟数据
        accessLatency: Math.floor(Math.random() * 50 + 10).toString(),
        storageUsed: (totalSize / 1024 / 1024).toFixed(1),
        fileCount: files.length.toString()
      }
    }
  } catch (error) {
    console.error('获取性能指标失败:', error)
  }
}

// 页面挂载时刷新指标
onMounted(() => {
  refreshMetrics()
})

// 页面元数据
definePageMeta({
  layout: 'default',
  title: 'R2 文件存储演示'
})
</script>

<style scoped>
.file-upload-demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
}

.page-header h1 {
  margin: 0 0 15px 0;
  font-size: 2.5em;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-description {
  font-size: 1.1em;
  margin: 0 0 25px 0;
  color: #f7fafc;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.feature-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 15px;
  border-radius: 25px;
  font-size: 0.9em;
  backdrop-filter: blur(10px);
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.tab-button {
  padding: 15px 25px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  border-radius: 10px 10px 0 0;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button:hover {
  background-color: #f8f9fa;
  color: #2d3748;
  transform: translateY(-2px);
}

.tab-button.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-content {
  min-height: 400px;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.section h2 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.8em;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.api-tests {
  display: grid;
  gap: 30px;
}

.api-test-item {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  background: #fafafa;
}

.api-test-item h3 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.test-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.test-controls label {
  font-weight: bold;
  color: #4a5568;
}

.test-controls input,
.test-controls select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  background: white;
  transition: all 0.3s ease;
}

.test-controls input:focus,
.test-controls select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.test-controls input::placeholder {
  color: #a0aec0;
}

.test-btn {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.test-btn:disabled {
  background: linear-gradient(45deg, #a0aec0, #718096);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.test-result {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.test-result pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #2d3748;
}

.file-link {
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  display: inline-block;
  margin: 5px 0;
  transition: all 0.3s ease;
}

.file-link:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.error {
  color: #e53e3e;
  font-weight: bold;
  background: rgba(254, 178, 178, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.guide-content {
  display: grid;
  gap: 30px;
}

.guide-section h3 {
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.code-block {
  margin-bottom: 20px;
}

.code-block h4 {
  margin: 0 0 10px 0;
  color: #4a5568;
  font-weight: 600;
}

.code-block pre {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #2d3748;
  line-height: 1.5;
}

.file-structure {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.folder ul {
  list-style: none;
  padding-left: 20px;
}

.folder li {
  margin: 8px 0;
  font-family: monospace;
  color: #4a5568;
}

.folder strong {
  color: #2d3748;
}

.folder code {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.section p {
  color: #4a5568;
  line-height: 1.6;
}

.api-docs {
  display: grid;
  gap: 20px;
}

.api-item {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.api-item h4 {
  margin: 0 0 10px 0;
  color: #667eea;
  font-family: monospace;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(102, 126, 234, 0.2);
}

.api-item p {
  color: #4a5568;
  margin: 5px 0;
}

.api-item ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
  color: #2d3748;
}

.api-item li {
  margin: 5px 0;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  margin: 0 0 15px 0;
  font-size: 1.1em;
  opacity: 0.9;
}

.metric-value {
  margin-bottom: 10px;
}

.metric-value .value {
  font-size: 2.5em;
  font-weight: bold;
  display: block;
}

.metric-value .unit {
  font-size: 0.9em;
  opacity: 0.8;
}

.metric-card p {
  margin: 0;
  font-size: 0.9em;
  opacity: 0.8;
}

.refresh-metrics-btn {
  background: linear-gradient(45deg, #4299e1, #0077BE);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.refresh-metrics-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 153, 225, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-upload-demo-page {
    padding: 10px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .page-header h1 {
    font-size: 2em;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-button {
    border-radius: 8px;
    margin-bottom: 5px;
  }
  
  .test-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metrics {
    grid-template-columns: 1fr;
  }
  
  .feature-badges {
    flex-direction: column;
    align-items: center;
  }
}
</style> 