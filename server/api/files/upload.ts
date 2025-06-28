export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'POST, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  setHeader(event, 'Access-Control-Max-Age', 86400)

  // 处理 OPTIONS 预检请求
  if (method === 'OPTIONS') {
    return ''
  }

  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const assets = event.context.cloudflare.env.ASSETS
  
  if (!assets) {
    throw createError({
      statusCode: 500,
      statusMessage: 'R2存储未绑定'
    })
  }

  try {
    // 获取请求体数据
    const formData = await readFormData(event)
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'
    const customName = formData.get('name') as string
    
    if (!file) {
      return {
        success: false,
        error: '请选择要上传的文件'
      }
    }

    // 验证文件类型
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg',
      'application/json', 'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `不支持的文件类型: ${file.type}`
      }
    }

    // 验证文件大小 (最大10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '文件大小不能超过10MB'
      }
    }

    // 生成文件key
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const fileName = customName || `${timestamp}_${randomSuffix}`
    const fileKey = `${category}/${fileName}.${fileExtension}`

    console.log('正在上传文件:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileKey: fileKey
    })

    // 上传到R2
    const uploadResult = await assets.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000', // 缓存1年
      },
      customMetadata: {
        originalName: file.name,
        uploadTime: new Date().toISOString(),
        category: category,
        userId: 'anonymous' // 可以后续添加用户认证
      }
    })

    console.log('文件上传结果:', uploadResult)

    // 生成访问URL
    const fileUrl = `/api/files/${fileKey}`
    
    return {
      success: true,
      message: '文件上传成功',
      data: {
        key: fileKey,
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category: category,
        uploadTime: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('文件上传失败:', error)
    return {
      success: false,
      error: '文件上传失败，请稍后再试',
      details: error instanceof Error ? error.message : String(error)
    }
  }
}) 