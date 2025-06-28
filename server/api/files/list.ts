export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  setHeader(event, 'Access-Control-Max-Age', 86400)

  // 处理 OPTIONS 预检请求
  if (method === 'OPTIONS') {
    return ''
  }

  if (method !== 'GET') {
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
    const query = getQuery(event)
    const prefix = (query.prefix as string) || '' // 前缀过滤（如按分类）
    const limit = Math.min(parseInt(query.limit as string) || 50, 1000) // 限制最大1000条
    const cursor = query.cursor as string // 分页游标
    
    console.log('正在列出文件:', { prefix, limit, cursor })

    // 列出文件
    const listOptions: {
      limit: number;
      prefix: string;
      cursor?: string;
    } = {
      limit,
      prefix
    }
    
    if (cursor) {
      listOptions.cursor = cursor
    }

    const result = await assets.list(listOptions)
    
    // 格式化文件信息
    const files = await Promise.all(
      result.objects.map(async (obj: any) => {
        try {
          // 获取文件的详细信息
          const fileInfo = await assets.get(obj.key)
          
          return {
            key: obj.key,
            size: obj.size,
            etag: obj.etag,
            uploaded: obj.uploaded,
            storageClass: obj.storageClass,
            // 从元数据中获取额外信息
            metadata: fileInfo?.customMetadata || {},
            httpMetadata: fileInfo?.httpMetadata || {},
            // 生成访问URL
            url: `/api/files/${obj.key}`,
            // 解析分类和文件名
            category: obj.key.split('/')[0] || 'general',
            fileName: obj.key.split('/').pop() || obj.key
          }
        } catch (error) {
          console.warn('无法获取文件详细信息:', obj.key, error)
          return {
            key: obj.key,
            size: obj.size,
            etag: obj.etag,
            uploaded: obj.uploaded,
            storageClass: obj.storageClass,
            metadata: {},
            httpMetadata: {},
            url: `/api/files/${obj.key}`,
            category: obj.key.split('/')[0] || 'general',
            fileName: obj.key.split('/').pop() || obj.key
          }
        }
      })
    )

    console.log(`文件列表获取成功: ${files.length} 个文件`)
    
    return {
      success: true,
      data: {
        files,
        truncated: result.truncated,
        cursor: result.cursor,
        delimitedPrefixes: result.delimitedPrefixes || [],
        // 统计信息
        count: files.length,
        totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
        // 按分类统计
        categories: files.reduce((acc: Record<string, number>, file) => {
          acc[file.category] = (acc[file.category] || 0) + 1
          return acc
        }, {})
      }
    }
    
  } catch (error: unknown) {
    console.error('文件列表获取失败:', error)
    return {
      success: false,
      error: '文件列表获取失败，请稍后再试',
      details: error instanceof Error ? error.message : String(error)
    }
  }
}) 