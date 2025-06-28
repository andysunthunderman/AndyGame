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

  const db = event.context.cloudflare.env.DB
  
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: '数据库未绑定'
    })
  }

  // 获取用户的运动记录
  if (method === 'GET') {
    try {
      const query = getQuery(event)
      const userId = query.userId
      
      if (!userId) {
        throw createError({
          statusCode: 400,
          statusMessage: '缺少用户ID'
        })
      }

      console.log('正在查询用户运动记录...')
      const records = await db.prepare(
        'SELECT * FROM sports_records WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(userId).all()
      console.log('运动记录查询结果:', records)
      
      return { results: records.results }
    } catch (error) {
      console.error('获取运动记录失败:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '获取运动记录失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  // 创建运动记录
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      console.log('创建运动记录请求体:', body)
      const { userId, sportType, duration, count } = body
      
      if (!userId || !sportType || !duration) {
        throw createError({
          statusCode: 400,
          statusMessage: '缺少必要参数'
        })
      }

      console.log('正在创建运动记录...')
      const result = await db.prepare(
        'INSERT INTO sports_records (user_id, sport_type, duration, count) VALUES (?, ?, ?, ?) RETURNING *'
      ).bind(userId, sportType, duration, count || null).all()
      console.log('创建运动记录结果:', result)
      
      setResponseStatus(event, 201)
      return { results: result.results }
    } catch (error) {
      console.error('创建运动记录失败:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '创建运动记录失败',
        data: { details: error instanceof Error ? error.message : String(error) }
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
}) 