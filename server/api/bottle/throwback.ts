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
    
    // 如果提供了bottleId，将特定的漂流瓶重新标记为未读
    if (body.bottleId) {
      console.log('正在将漂流瓶扔回海里:', body.bottleId)
      
      const result = await db.prepare(
        'UPDATE bottles SET is_read = FALSE WHERE id = ?'
      ).bind(body.bottleId).run()
      
      console.log('漂流瓶扔回结果:', result)
      
      return {
        success: true,
        message: '漂流瓶已重新投入海中，等待下一个有缘人发现'
      }
    }
    
    // 如果有内容但没有bottleId，说明这是一个新的漂流瓶
    if (body.content && body.content.trim()) {
      console.log('正在创建新的漂流瓶并投入海中...')
      
      const result = await db.prepare(
        'INSERT INTO bottles (content, user_id, is_read, created_at) VALUES (?, ?, FALSE, datetime("now")) RETURNING id'
      ).bind(body.content.trim(), 'anonymous').all()
      
      console.log('新漂流瓶创建结果:', result)
      
      return {
        success: true,
        message: '漂流瓶已投入海中',
        bottleId: result.results[0]?.id
      }
    }
    
    return {
      success: false,
      error: '没有可以扔回的漂流瓶'
    }
    
  } catch (error) {
    console.error('扔回漂流瓶失败:', error)
    return {
      success: false,
      error: '操作失败，请稍后再试'
    }
  }
}) 