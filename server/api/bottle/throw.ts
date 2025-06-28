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
    
    if (!body.content || !body.content.trim()) {
      return {
        success: false,
        error: '漂流瓶内容不能为空'
      }
    }

    if (body.content.length > 500) {
      return {
        success: false,
        error: '漂流瓶内容不能超过500字'
      }
    }

    console.log('正在投掷漂流瓶...')
    
    // 插入漂流瓶，默认为未读状态，使用匿名用户
    const result = await db.prepare(
      'INSERT INTO bottles (content, user_id, is_read, created_at) VALUES (?, ?, FALSE, datetime("now")) RETURNING id'
    ).bind(body.content.trim(), 'anonymous').all()

    console.log('漂流瓶投掷结果:', result)

    return {
      success: true,
      message: '漂流瓶已成功投掷到海中！',
      bottleId: result.results[0]?.id
    }
  } catch (error) {
    console.error('投掷漂流瓶失败:', error)
    return {
      success: false,
      error: '投掷失败，请稍后再试'
    }
  }
}) 