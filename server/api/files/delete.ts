export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  setHeader(event, 'Access-Control-Max-Age', 86400)

  // 处理 OPTIONS 预检请求
  if (method === 'OPTIONS') {
    return ''
  }

  if (!['DELETE', 'POST'].includes(method)) {
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
    const body = await readBody(event)
    const { fileKey, adminKey } = body
    
    if (!fileKey) {
      return {
        success: false,
        error: '文件路径不能为空'
      }
    }

    // 简单的管理员验证（生产环境中应使用更强的认证）
    // 可以从环境变量中读取管理员密钥
    const expectedAdminKey = event.context.cloudflare.env.ADMIN_SECRET || 'your-admin-secret'
    if (adminKey !== expectedAdminKey) {
      return {
        success: false,
        error: '无权限删除文件'
      }
    }

    console.log('正在删除文件:', fileKey)

    // 检查文件是否存在
    const object = await assets.get(fileKey)
    if (!object) {
      return {
        success: false,
        error: '文件不存在'
      }
    }

    // 删除文件
    await assets.delete(fileKey)
    
    console.log('文件删除成功:', fileKey)
    
    return {
      success: true,
      message: '文件删除成功',
      data: {
        deletedKey: fileKey,
        deleteTime: new Date().toISOString()
      }
    }
    
  } catch (error: unknown) {
    console.error('文件删除失败:', error)
    return {
      success: false,
      error: '文件删除失败，请稍后再试',
      details: error instanceof Error ? error.message : String(error)
    }
  }
}) 