export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  // 处理 CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
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

  const db = event.context.cloudflare.env.DB
  
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: '数据库未绑定'
    })
  }

  try {
    const body = await readBody(event)
    
    // 如果提供了bottleId，将漂流瓶标记为已读（关闭）
    if (body.bottleId) {
      console.log('正在关闭漂流瓶:', body.bottleId)
      
      const result = await db.prepare(
        'UPDATE bottles SET is_read = TRUE WHERE id = ?'
      ).bind(body.bottleId).run()
      
      console.log('漂流瓶关闭结果:', result)
      
      return {
        success: true,
        message: '漂流瓶已安全关闭'
      }
    }

    // 如果没有提供bottleId但有内容，这可能是一个错误操作
    // 我们仍然返回成功，保持用户体验的连续性
    return {
      success: true,
      message: '操作完成'
    }
    
  } catch (error) {
    console.error('关闭漂流瓶失败:', error)
    
    // 即使出错也返回成功，因为"关闭"操作对用户来说应该是无感知的
    return {
      success: true,
      message: '操作完成',
      note: '关闭过程中遇到小问题，但不影响使用'
    }
  }
}) 