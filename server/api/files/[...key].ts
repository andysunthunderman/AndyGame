export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  setHeader(event, 'Access-Control-Max-Age', 86400)

  // 处理 OPTIONS 预检请求
  if (method === 'OPTIONS') {
    return ''
  }

  if (method !== 'GET' && method !== 'HEAD') {
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
    // 获取文件key（路径参数）
    const pathParams = getRouterParams(event)
    const fileKey = Array.isArray(pathParams.key) ? pathParams.key.join('/') : pathParams.key
    
    if (!fileKey) {
      throw createError({
        statusCode: 400,
        statusMessage: '文件路径不能为空'
      })
    }

    console.log('正在获取文件:', fileKey)

    // 从R2获取文件
    const object = await assets.get(fileKey)
    
    if (!object) {
      throw createError({
        statusCode: 404,
        statusMessage: '文件不存在'
      })
    }

    // 设置响应头
    const headers = new Headers()
    
    // 从对象元数据中获取内容类型
    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType)
    }
    
    // 设置缓存头
    if (object.httpMetadata?.cacheControl) {
      headers.set('Cache-Control', object.httpMetadata.cacheControl)
    } else {
      headers.set('Cache-Control', 'public, max-age=31536000') // 默认缓存1年
    }
    
    // 设置ETag
    if (object.httpEtag) {
      headers.set('ETag', object.httpEtag)
    }
    
    // 设置文件大小
    if (object.size) {
      headers.set('Content-Length', object.size.toString())
    }
    
    // 从自定义元数据中获取原始文件名
    const originalName = object.customMetadata?.originalName
    if (originalName) {
      headers.set('X-Original-Name', originalName)
    }
    
    // 记录访问日志
    console.log('文件访问成功:', {
      fileKey,
      size: object.size,
      contentType: object.httpMetadata?.contentType,
      originalName: originalName
    })

    // 将Headers对象转换为普通对象
    const responseHeaders: Record<string, string> = {}
    headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // 对于 HEAD 请求，只返回头部信息，不返回文件内容
    if (method === 'HEAD') {
      return new Response(null, {
        headers: responseHeaders
      })
    }

    // 返回文件流
    return new Response(object.body, {
      headers: responseHeaders
    })
    
  } catch (error: unknown) {
    console.error('文件获取失败:', error)
    
    // 检查是否是已知的HTTP错误
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '文件获取失败',
      data: { details: error instanceof Error ? error.message : String(error) }
    })
  }
}) 